import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, createServerSupabase, requireAdmin } from "@/lib/auth";
import { schoolInstant } from "@/lib/time";

/**
 * GET /api/dashboard/export — Sprint 3 : export CSV des absences d'une journée.
 * Params : date (défaut aujourd'hui Conakry), classe?.
 * Une ligne par élève sans scan pour chaque cours prévu ce jour (fuseau scolaire).
 */

type CourseRow = { id: string; nom: string; classe_id: string; jour_semaine: number };

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request.cookies.get(SESSION_COOKIE)?.value);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const params = request.nextUrl.searchParams;
  const now = schoolInstant();
  const date = params.get("date") ?? now.jour;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date_invalide" }, { status: 400 });
  }
  const classeFilter = params.get("classe") ?? undefined;
  const nextDay = new Date(`${date}T00:00:00.000Z`);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  const supabase = createServerSupabase(request.cookies.get(SESSION_COOKIE)?.value);
  const [classesRes, coursesRes, studentsRes, attendanceRes] = await Promise.all([
    supabase.from("classes").select("id, nom"),
    supabase.from("courses").select("id, nom, classe_id, jour_semaine"),
    supabase.from("students").select("id, nom, classe_id").order("nom"),
    supabase
      .from("attendance")
      .select("student_id, course_id")
      .gte("scanned_at", `${date}T00:00:00+00:00`)
      .lt("scanned_at", `${nextDay.toISOString().slice(0, 10)}T00:00:00+00:00`),
  ]);
  if (classesRes.error || coursesRes.error || studentsRes.error || attendanceRes.error) {
    return NextResponse.json({ error: "erreur_base" }, { status: 500 });
  }

  const classNameById = new Map(
    (classesRes.data as Array<{ id: string; nom: string }>).map((c) => [c.id, c.nom])
  );
  const weekday = new Date(`${date}T12:00:00.000Z`).getUTCDay();
  const allStudents = studentsRes.data as Array<{ id: string; nom: string; classe_id: string }>;

  const visibleStudents = allStudents.filter(
    (s) => !classeFilter || s.classe_id === classeFilter
  );
  const classIds = new Set(visibleStudents.map((s) => s.classe_id));
  const planned = (coursesRes.data as CourseRow[]).filter(
    (c) => c.jour_semaine === weekday && classIds.has(c.classe_id)
  );
  const scannedPairs = new Set(
    (attendanceRes.data as Array<{ student_id: string; course_id: string }>).map(
      (a) => `${a.student_id}|${a.course_id}`
    )
  );

  const lines: string[] = [
    ["date", "eleve", "classe", "cours", "statut"].map(csvEscape).join(","),
  ];
  for (const student of visibleStudents) {
    for (const course of planned) {
      if (course.classe_id !== student.classe_id) continue;
      if (scannedPairs.has(`${student.id}|${course.id}`)) continue;
      lines.push(
        [date, student.nom, classNameById.get(student.classe_id) ?? "", course.nom, "absent"]
          .map(csvEscape)
          .join(",")
      );
    }
  }

  return new NextResponse(`\uFEFF${lines.join("\n")}`, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="absences-${date}.csv"`,
    },
  });
}
