import { NextResponse, type NextRequest } from "next/server";
import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
  requestAccessToken,
  createServerSupabase,
  requireAdmin,
  setSessionCookies,
} from "@/lib/auth";
import { dayWindow, isIsoDate, weekdayOfIso } from "@/lib/dashboard";
import { buildAbsencesCsv } from "@/lib/csv";
import { schoolInstant } from "@/lib/time";

/**
 * GET /api/dashboard/export — Sprint 3 : export CSV des absences d'une journée.
 * Params : date (défaut aujourd'hui Conakry), classe?.
 * Une ligne par élève sans scan pour chaque cours prévu ce jour (fuseau scolaire).
 */

export async function GET(request: NextRequest) {
  const accessToken = requestAccessToken(request);
  const auth = await requireAdmin(accessToken, request.cookies.get(REFRESH_COOKIE)?.value);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const params = request.nextUrl.searchParams;
  const date = params.get("date") ?? schoolInstant().jour;
  if (!isIsoDate(date)) {
    return NextResponse.json({ error: "date_invalide" }, { status: 400 });
  }
  const classeFilter = params.get("classe") ?? undefined;
  const { startAt, endAt } = dayWindow(date);

  const supabase = createServerSupabase(auth.session?.access_token ?? accessToken);
  const [classesRes, coursesRes, studentsRes, attendanceRes] = await Promise.all([
    supabase.from("classes").select("id, nom"),
    supabase.from("courses").select("id, nom, classe_id, jour_semaine, heure_debut, heure_fin"),
    supabase.from("students").select("id, nom, classe_id").order("nom"),
    supabase
      .from("attendance")
      .select("student_id, course_id")
      .gte("scanned_at", startAt)
      .lt("scanned_at", endAt),
  ]);
  if (classesRes.error || coursesRes.error || studentsRes.error || attendanceRes.error) {
    return NextResponse.json({ error: "erreur_base" }, { status: 500 });
  }

  const csv = buildAbsencesCsv(
    {
      classes: (classesRes.data ?? []) as never,
      courses: (coursesRes.data ?? []) as never,
      students: (studentsRes.data ?? []) as never,
      attendance: (attendanceRes.data ?? []) as never,
    },
    { date, weekday: weekdayOfIso(date), classe: classeFilter, now: schoolInstant() }
  );

  const response = new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="absences-${date}.csv"`,
    },
  });
  if (auth.session) setSessionCookies(response, auth.session);
  return response;
}
