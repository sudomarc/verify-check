import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, createServerSupabase, requireAdmin } from "@/lib/auth";
import { SCHOOL_TIME_ZONE, schoolInstant } from "@/lib/time";

/**
 * GET /api/dashboard — Sprint 3 : requêtes du dashboard direction.
 * Params : date (YYYY-MM-DD, défaut = aujourd'hui Conakry), classe?, cours?, eleve?
 * Réponse : planning du jour (cours de la classe prévus ce jour de semaine local),
 * effectif, présences de la journée, résumé par cours.
 * L'accès est protégé par la session admin ; RLS filtre les lignes côté base.
 */

type CourseRow = {
  id: string;
  nom: string;
  classe_id: string;
  salle: string | null;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
};

function isoDateRegexOk(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function nextDayIso(date: string): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request.cookies.get(SESSION_COOKIE)?.value);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const params = request.nextUrl.searchParams;
  const now = schoolInstant();
  const date = params.get("date") ?? now.jour;
  if (!isoDateRegexOk(date)) {
    return NextResponse.json({ error: "date_invalide" }, { status: 400 });
  }

  // Fenêtre de la journée scolaire : Conakry = GMT+0, donc bornes UTC directes.
  const startAt = `${date}T00:00:00+00:00`;
  const endAt = `${nextDayIso(date)}T00:00:00+00:00`;

  const supabase = createServerSupabase(request.cookies.get(SESSION_COOKIE)?.value);

  const [classesRes, coursesRes, studentsRes, attendanceRes] = await Promise.all([
    supabase.from("classes").select("id, nom").order("nom"),
    supabase
      .from("courses")
      .select("id, nom, classe_id, salle, jour_semaine, heure_debut, heure_fin")
      .order("heure_debut"),
    supabase.from("students").select("id, nom, code_qr, classe_id").order("nom"),
    supabase
      .from("attendance")
      .select("id, student_id, course_id, scanned_at")
      .gte("scanned_at", startAt)
      .lt("scanned_at", endAt),
  ]);

  if (classesRes.error || coursesRes.error || studentsRes.error || attendanceRes.error) {
    return NextResponse.json({ error: "erreur_base" }, { status: 500 });
  }
  const classes = classesRes.data as Array<{ id: string; nom: string }> | null;
  const courses = coursesRes.data as CourseRow[] | null;
  const students =
    studentsRes.data as Array<{ id: string; nom: string; code_qr: string; classe_id: string }> | null;
  const attendance =
    attendanceRes.data as Array<{ id: string; student_id: string; course_id: string; scanned_at: string }> | null;

  // Jour de semaine local de la date demandée (Conakry = GMT+0 → jour UTC).
  const weekday = new Date(`${date}T12:00:00.000Z`).getUTCDay();

  const classeFilter = params.get("classe") ?? undefined;
  const coursFilter = params.get("cours") ?? undefined;
  const eleveFilter = params.get("eleve") ?? undefined;

  const allCourses = courses ?? [];
  const plannedCourses = allCourses.filter(
    (c) => c.jour_semaine === weekday && (!classeFilter || c.classe_id === classeFilter)
  );

  const visibleStudents = (students ?? [])
    .filter((s) => !classeFilter || s.classe_id === classeFilter)
    .filter((s) => !eleveFilter || s.id === eleveFilter);

  const plannedCourseIds = new Set(plannedCourses.map((c) => c.id));
  const rows = (attendance ?? [])
    .filter((a) => plannedCourseIds.has(a.course_id))
    .filter((a) => visibleStudents.some((s) => s.id === a.student_id));

  const presentByStudent = new Map<string, typeof rows>();
  for (const row of rows) {
    const list = presentByStudent.get(row.student_id) ?? [];
    list.push(row);
    presentByStudent.set(row.student_id, list);
  }

  const summary = {
    date,
    fuseau: SCHOOL_TIME_ZONE,
    jour_semaine: weekday,
    classes: classes ?? [],
    cours_prevus: plannedCourses,
    effectif: visibleStudents.length,
    presents: visibleStudents.filter((s) => (presentByStudent.get(s.id)?.length ?? 0) > 0).length,
    scans: rows.length,
  };

  return NextResponse.json({
    ...summary,
    eleves: visibleStudents.map((s) => ({
      ...s,
      scans: (presentByStudent.get(s.id) ?? []).length,
      presences: (presentByStudent.get(s.id) ?? []).map((row) => ({
        course_id: row.course_id,
        scanned_at: row.scanned_at,
      })),
    })),
  });
}
