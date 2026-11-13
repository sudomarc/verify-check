/**
 * Calculs purs du dashboard (Sprint 3) — testables sans réseau ni base.
 * Toutes les dates sont des journées scolaires Africa/Conakry (GMT+0, pas
 * d'heure d'été : les bornes UTC de la journée locale sont donc directes).
 */

import { SCHOOL_TIME_ZONE } from "./time.ts";

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function nextDayIso(date: string): string {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Jour de semaine (0 = dimanche) de la date scolaire demandée. */
export function weekdayOfIso(date: string): number {
  return new Date(`${date}T12:00:00.000Z`).getUTCDay();
}

/** Fenêtre [début, fin) de la journée scolaire, en horodatages UTC. */
export function dayWindow(date: string): { startAt: string; endAt: string } {
  return {
    startAt: `${date}T00:00:00+00:00`,
    endAt: `${nextDayIso(date)}T00:00:00+00:00`,
  };
}

export type ClassRow = { id: string; nom: string };
export type CourseRow = {
  id: string;
  nom: string;
  classe_id: string;
  salle: string | null;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
};
export type StudentRow = { id: string; nom: string; code_qr: string; classe_id: string };
export type AttendanceRow = {
  id: string;
  student_id: string;
  course_id: string;
  scanned_at: string;
};

export type DashboardFilters = {
  date: string;
  classe?: string;
  cours?: string;
  eleve?: string;
};

export type DashboardResult = {
  date: string;
  fuseau: string;
  jour_semaine: number;
  classes: ClassRow[];
  cours_prevus: CourseRow[];
  effectif: number;
  presents: number;
  scans: number;
  eleves: Array<{
    id: string;
    nom: string;
    code_qr: string;
    classe_id: string;
    scans: number;
    presences: Array<{ course_id: string; scanned_at: string }>;
  }>;
};

/** Agrège les données brutes en planning + résumé + présence par élève. */
export function buildDashboard(
  raw: {
    classes: ClassRow[];
    courses: CourseRow[];
    students: StudentRow[];
    attendance: AttendanceRow[];
  },
  filters: DashboardFilters
): DashboardResult {
  const weekday = weekdayOfIso(filters.date);

  const plannedCourses = raw.courses.filter(
    (c) =>
      c.jour_semaine === weekday &&
      (!filters.cours || c.id === filters.cours) &&
      (!filters.classe || c.classe_id === filters.classe)
  );

  const visibleStudents = raw.students
    .filter((s) => !filters.classe || s.classe_id === filters.classe)
    .filter((s) => !filters.eleve || s.id === filters.eleve);

  const plannedCourseIds = new Set(plannedCourses.map((c) => c.id));
  const visibleStudentIds = new Set(visibleStudents.map((s) => s.id));
  const rows = raw.attendance.filter(
    (a) => plannedCourseIds.has(a.course_id) && visibleStudentIds.has(a.student_id)
  );

  const presencesByStudent = new Map<string, AttendanceRow[]>();
  for (const row of rows) {
    const list = presencesByStudent.get(row.student_id) ?? [];
    list.push(row);
    presencesByStudent.set(row.student_id, list);
  }

  const presentCount = visibleStudents.filter(
    (s) => (presencesByStudent.get(s.id)?.length ?? 0) > 0
  ).length;

  return {
    date: filters.date,
    fuseau: SCHOOL_TIME_ZONE,
    jour_semaine: weekday,
    classes: raw.classes,
    cours_prevus: plannedCourses,
    effectif: visibleStudents.length,
    presents: presentCount,
    scans: rows.length,
    eleves: visibleStudents.map((s) => ({
      id: s.id,
      nom: s.nom,
      code_qr: s.code_qr,
      classe_id: s.classe_id,
      scans: (presencesByStudent.get(s.id) ?? []).length,
      presences: (presencesByStudent.get(s.id) ?? []).map((row) => ({
        course_id: row.course_id,
        scanned_at: row.scanned_at,
      })),
    })),
  };
}
