/**
 * Export CSV des absences (Sprint 3) — logique pure, testable sans base.
 * Une ligne par (élève × cours prévu ce jour scolaire) sans scan.
 */

export function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export type CsvClassRow = { id: string; nom: string };
export type CsvCourseRow = { id: string; nom: string; classe_id: string; jour_semaine: number; heure_fin?: string };
export type CsvStudentRow = { id: string; nom: string; classe_id: string };
export type CsvAttendanceRow = { student_id: string; course_id: string };

export function buildAbsencesCsv(
  raw: { classes: CsvClassRow[]; courses: CsvCourseRow[]; students: CsvStudentRow[]; attendance: CsvAttendanceRow[] },
  options: { date: string; weekday: number; classe?: string; cours?: string; now?: { jour: string; heure: string } }
): string {
  const classNameById = new Map(raw.classes.map((c) => [c.id, c.nom]));
  const visibleStudents = raw.students.filter((s) => !options.classe || s.classe_id === options.classe);
  const classIds = new Set(visibleStudents.map((s) => s.classe_id));
  const planned = raw.courses.filter((c) => c.jour_semaine === options.weekday && classIds.has(c.classe_id) && (!options.cours || c.id === options.cours));
  const termines = planned.filter((c) => {
    if (!options.now || options.date < options.now.jour) return true;
    if (options.date > options.now.jour || !c.heure_fin) return false;
    const [h, m] = c.heure_fin.split(":").map(Number);
    const fin = (h ?? 0) * 60 + (m ?? 0);
    const [nh, nm] = options.now.heure.split(":").map(Number);
    return fin <= (nh ?? 0) * 60 + (nm ?? 0);
  });
  const scannedPairs = new Set(raw.attendance.map((a) => `${a.student_id}|${a.course_id}`));
  const lines = [["date", "eleve", "classe", "cours", "statut"].map(csvEscape).join(",")];
  for (const student of visibleStudents) {
    for (const course of termines) {
      if (course.classe_id !== student.classe_id || scannedPairs.has(`${student.id}|${course.id}`)) continue;
      lines.push([options.date, student.nom, classNameById.get(student.classe_id) ?? "", course.nom, "absent"].map(csvEscape).join(","));
    }
  }
  return `\uFEFF${lines.join("\r\n")}`;
}
