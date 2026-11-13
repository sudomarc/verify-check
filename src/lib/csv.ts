/**
 * Export CSV des absences (Sprint 3) — logique pure, testable sans base.
 * Une ligne par (élève × cours prévu ce jour scolaire) sans scan.
 */

export function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export type CsvClassRow = { id: string; nom: string };
export type CsvCourseRow = { id: string; nom: string; classe_id: string; jour_semaine: number };
export type CsvStudentRow = { id: string; nom: string; classe_id: string };
export type CsvAttendanceRow = { student_id: string; course_id: string };

export function buildAbsencesCsv(
  raw: {
    classes: CsvClassRow[];
    courses: CsvCourseRow[];
    students: CsvStudentRow[];
    attendance: CsvAttendanceRow[];
  },
  options: { date: string; weekday: number; classe?: string }
): string {
  const classNameById = new Map(raw.classes.map((c) => [c.id, c.nom]));

  const visibleStudents = raw.students.filter(
    (s) => !options.classe || s.classe_id === options.classe
  );
  const classIds = new Set(visibleStudents.map((s) => s.classe_id));
  const planned = raw.courses.filter(
    (c) => c.jour_semaine === options.weekday && classIds.has(c.classe_id)
  );
  const scannedPairs = new Set(raw.attendance.map((a) => `${a.student_id}|${a.course_id}`));

  const lines: string[] = [
    ["date", "eleve", "classe", "cours", "statut"].map(csvEscape).join(","),
  ];
  for (const student of visibleStudents) {
    for (const course of planned) {
      if (course.classe_id !== student.classe_id) continue;
      if (scannedPairs.has(`${student.id}|${course.id}`)) continue;
      lines.push(
        [
          options.date,
          student.nom,
          classNameById.get(student.classe_id) ?? "",
          course.nom,
          "absent",
        ]
          .map(csvEscape)
          .join(",")
      );
    }
  }
  // BOM UTF-8 pour Excel + retours CRLF (CSV RFC 4180).
  return `\uFEFF${lines.join("\r\n")}`;
}
