"use client";

import { useMemo, useState } from "react";
import {
  getAttendanceByCourse,
  getCoursesByClasse,
  getStudentsByClasse,
  mockAttendance,
  mockClasses,
  mockCourses,
  mockStudents,
  type Course,
  type Student,
} from "@/lib/mock-data";
import styles from "./Dashboard.module.css";

type View = "classe" | "cours" | "eleve";

const VIEWS: { id: View; label: string }[] = [
  { id: "classe", label: "Par classe" },
  { id: "cours", label: "Par cours" },
  { id: "eleve", label: "Par élève" },
];

const TIME_ZONE = "Africa/Conakry";
const DEMO_DATE = "2026-11-09";
const DEMO_DATE_VALUE = new Date(`${DEMO_DATE}T00:00:00.000Z`);
const DEMO_DATE_LABEL = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
}).format(DEMO_DATE_VALUE);
const DEMO_WEEKDAY = DEMO_DATE_VALUE.getUTCDay();

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});

const dayFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: TIME_ZONE,
});

type StudentSummary = {
  student: Student;
  scans: number;
  coursesSeen: number;
  lastScanAt: string | null;
};

function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso));
}

function formatDay(iso: string): string {
  return dayFormatter.format(new Date(iso));
}

function isOnDemoDate(iso: string): boolean {
  const parts = dateFormatter.formatToParts(new Date(iso));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  return (
    year !== undefined &&
    month !== undefined &&
    day !== undefined &&
    `${year}-${month}-${day}` === DEMO_DATE
  );
}

function className(classeId: string): string {
  return mockClasses.find((classe) => classe.id === classeId)?.nom ?? "Classe inconnue";
}

function courseName(courseId: string): string {
  return mockCourses.find((course) => course.id === courseId)?.nom ?? "Cours inconnu";
}

function percent(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className={styles.kpi}>
      <p className={styles.kpiLabel}>{label}</p>
      <p className={styles.kpiValue}>{value}</p>
      {hint ? <p className={styles.kpiHint}>{hint}</p> : null}
    </div>
  );
}

function StatusBadge({ present }: { present: boolean }) {
  return (
    <span className={present ? styles.present : styles.absent}>
      {present ? "Présent" : "Absent"}
    </span>
  );
}

export default function DashboardClient() {
  const [view, setView] = useState<View>("classe");
  const [classId, setClassId] = useState(mockClasses[0]?.id ?? "");
  const [courseId, setCourseId] = useState(mockCourses[0]?.id ?? "");
  const [studentId, setStudentId] = useState(mockStudents[0]?.id ?? "");

  const classData = useMemo(() => {
    const students = getStudentsByClasse(classId);
    const courses = getCoursesByClasse(classId).filter(
      (course) => course.jour_semaine === DEMO_WEEKDAY
    );
    const courseIds = new Set(courses.map((course) => course.id));
    const entriesByStudent = new Map<string, { courseId: string; scannedAt: string }[]>();

    for (const entry of mockAttendance) {
      if (!courseIds.has(entry.course_id) || !isOnDemoDate(entry.scanned_at)) continue;
      const list = entriesByStudent.get(entry.student_id) ?? [];
      list.push({ courseId: entry.course_id, scannedAt: entry.scanned_at });
      entriesByStudent.set(entry.student_id, list);
    }

    const rows: StudentSummary[] = students.map((student) => {
      const entries = (entriesByStudent.get(student.id) ?? [])
        .slice()
        .sort((a, b) => a.scannedAt.localeCompare(b.scannedAt));
      return {
        student,
        scans: entries.length,
        coursesSeen: new Set(entries.map((entry) => entry.courseId)).size,
        lastScanAt: entries.length > 0 ? entries[entries.length - 1].scannedAt : null,
      };
    });

    const present = rows.filter((row) => row.scans > 0).length;

    return {
      classeName: className(classId),
      students,
      courses,
      rows,
      present,
      absent: students.length - present,
      rate: percent(present, students.length),
    };
  }, [classId]);

  const selectedCourse: Course =
    mockCourses.find((course) => course.id === courseId) ?? mockCourses[0];

  const courseData = useMemo(() => {
    const students = getStudentsByClasse(selectedCourse.classe_id);
    const hasScheduledSession = selectedCourse.jour_semaine === DEMO_WEEKDAY;
    const entries = hasScheduledSession
      ? getAttendanceByCourse(selectedCourse.id).filter((entry) => isOnDemoDate(entry.scanned_at))
      : [];
    const entryByStudent = new Map(entries.map((entry) => [entry.student_id, entry] as const));

    const rows = students.map((student) => {
      const entry = entryByStudent.get(student.id);
      return { student, scannedAt: entry?.scanned_at ?? null };
    });

    const present = rows.filter((row) => row.scannedAt !== null).length;

    return {
      hasScheduledSession,
      students,
      rows,
      present,
      absent: students.length - present,
      rate: percent(present, students.length),
    };
  }, [selectedCourse]);

  const selectedStudent =
    mockStudents.find((student) => student.id === studentId) ?? mockStudents[0];

  const studentData = useMemo(() => {
    const courses = getCoursesByClasse(selectedStudent.classe_id).filter(
      (course) => course.jour_semaine === DEMO_WEEKDAY
    );
    const demoDateEntries = mockAttendance.filter(
      (entry) => entry.student_id === selectedStudent.id && isOnDemoDate(entry.scanned_at)
    );
    const history = mockAttendance
      .filter((entry) => entry.student_id === selectedStudent.id)
      .map((entry) => ({ entry, course: courseName(entry.course_id) }))
      .sort((a, b) => b.entry.scanned_at.localeCompare(a.entry.scanned_at));
    const seen = new Set(demoDateEntries.map((entry) => entry.course_id));
    const missed = courses.filter((course) => !seen.has(course.id));

    return {
      courses,
      scans: demoDateEntries.length,
      history,
      missed,
      rate: percent(seen.size, courses.length),
    };
  }, [selectedStudent]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.mark} aria-hidden="true">
              VC
            </span>
            <div>
              <p className={styles.eyebrow}>VerifyCheck · Direction</p>
              <h1 className={styles.title}>Tableau de bord</h1>
            </div>
          </div>
          <span className={styles.demoBadge}>Maquette · données fictives</span>
        </header>

        <section className={styles.toolbar} aria-label="Filtres du tableau de bord">
          <div className={styles.field}>
            <label htmlFor="demo-date">Date</label>
            <select id="demo-date" defaultValue={DEMO_DATE} disabled>
              <option value={DEMO_DATE}>{DEMO_DATE_LABEL}</option>
            </select>
          </div>
          <p className={styles.toolbarNote}>
            Filtres date et export activés au Sprint 3.
          </p>
          <button type="button" className={styles.exportButton} disabled>
            Exporter CSV
          </button>
        </section>

        <div className={styles.tabs} role="group" aria-label="Type de vue">
          {VIEWS.map((item) => (
            <button
              key={item.id}
              type="button"
              id={`tab-${item.id}`}
              aria-pressed={view === item.id}
              className={view === item.id ? styles.tabActive : styles.tab}
              onClick={() => setView(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section
          id="dashboard-panel"
          aria-labelledby={`tab-${view}`}
          className={styles.panel}
        >
          {view === "classe" ? (
            <>
              <div className={styles.viewHead}>
                <div className={styles.field}>
                  <label htmlFor="class-select">Classe</label>
                  <select
                    id="class-select"
                    value={classId}
                    onChange={(event) => setClassId(event.target.value)}
                  >
                    {mockClasses.map((classe) => (
                      <option key={classe.id} value={classe.id}>
                        {classe.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <p className={styles.context}>
                  {classData.courses.length} cours au planning pour le {DEMO_DATE_LABEL}
                </p>
              </div>

                {classData.courses.length === 0 ? (
                  <p className={styles.empty}>
                    Aucun cours prévu pour cette classe le {DEMO_DATE_LABEL}.
                  </p>
                ) : (
                  <>
                    <div className={styles.kpis}>
                      <Kpi label="Effectif" value={String(classData.students.length)} />
                      <Kpi label="Ont scanné" value={String(classData.present)} />
                      <Kpi label="Absents" value={String(classData.absent)} />
                      <Kpi
                        label="Taux de présence"
                        value={`${classData.rate} %`}
                        hint="élèves avec ≥ 1 scan"
                      />
                    </div>

                    <div className={styles.tableWrap}>
                      <table className={styles.table}>
                        <caption className={styles.srOnly}>
                          Présence des élèves de {classData.classeName}
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col">Élève</th>
                            <th scope="col">Scans</th>
                            <th scope="col">Cours suivis</th>
                            <th scope="col">Dernier scan</th>
                            <th scope="col">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classData.rows.map((row) => (
                            <tr key={row.student.id}>
                              <td>{row.student.nom}</td>
                              <td>{row.scans}</td>
                              <td>
                                {row.coursesSeen} / {classData.courses.length}
                              </td>
                              <td>{row.lastScanAt ? formatTime(row.lastScanAt) : "—"}</td>
                              <td>
                                <StatusBadge present={row.scans > 0} />
                              </td>
                            </tr>
                          ))}
                          {classData.rows.length === 0 ? (
                            <tr>
                              <td colSpan={5} className={styles.empty}>
                                Aucun élève dans cette classe.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>
                    <p className={styles.footnote}>
                      Un élève est « présent » s&apos;il a au moins un scan sur la journée de démo.
                    </p>
                  </>
                )}
            </>
          ) : null}

          {view === "cours" ? (
            <>
              <div className={styles.viewHead}>
                <div className={styles.field}>
                  <label htmlFor="course-select">Cours</label>
                  <select
                    id="course-select"
                    value={selectedCourse.id}
                    onChange={(event) => setCourseId(event.target.value)}
                  >
                    {mockCourses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.nom} — {className(course.classe_id)}
                      </option>
                    ))}
                  </select>
                </div>
                <p className={styles.context}>
                  {className(selectedCourse.classe_id)} · {formatTimeSlot(selectedCourse)} ·{" "}
                  {DEMO_DATE_LABEL}
                </p>
              </div>

              {courseData.hasScheduledSession ? (
                <>
                  <div className={styles.kpis}>
                    <Kpi label="Effectif" value={String(courseData.students.length)} />
                    <Kpi label="Présents" value={String(courseData.present)} />
                    <Kpi label="Absents" value={String(courseData.absent)} />
                    <Kpi label="Taux de présence" value={`${courseData.rate} %`} />
                  </div>

                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <caption className={styles.srOnly}>
                        Présence des élèves au cours de {selectedCourse.nom}
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Élève</th>
                          <th scope="col">Heure du scan</th>
                          <th scope="col">Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courseData.rows.map((row) => (
                          <tr key={row.student.id}>
                            <td>{row.student.nom}</td>
                            <td>{row.scannedAt ? formatTime(row.scannedAt) : "—"}</td>
                            <td>
                              <StatusBadge present={row.scannedAt !== null} />
                            </td>
                          </tr>
                        ))}
                        {courseData.rows.length === 0 ? (
                          <tr>
                            <td colSpan={3} className={styles.empty}>
                              Aucun élève dans la classe de ce cours.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                  <p className={styles.footnote}>
                    Règle cible : un seul scan compté par élève, par cours et par jour.
                  </p>
                </>
              ) : (
                <p className={styles.empty}>
                  Aucune séance de ce cours prévue le {DEMO_DATE_LABEL}.
                </p>
              )}
            </>
          ) : null}

          {view === "eleve" ? (
            <>
              <div className={styles.viewHead}>
                <div className={styles.field}>
                  <label htmlFor="student-select">Élève</label>
                  <select
                    id="student-select"
                    value={selectedStudent.id}
                    onChange={(event) => setStudentId(event.target.value)}
                  >
                    {mockStudents.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.nom} — {className(student.classe_id)}
                      </option>
                    ))}
                  </select>
                </div>
                <p className={styles.context}>Carte QR : {selectedStudent.code_qr}</p>
              </div>

              {studentData.courses.length === 0 ? (
                <p className={styles.empty}>
                  Aucun cours prévu pour cette classe le {DEMO_DATE_LABEL}.
                </p>
              ) : (
                <div className={styles.kpis}>
                  <Kpi label="Scans enregistrés" value={String(studentData.scans)} />
                  <Kpi
                    label="Cours suivis"
                    value={`${studentData.courses.length - studentData.missed.length} / ${studentData.courses.length}`}
                  />
                  <Kpi label="Cours manqués" value={String(studentData.missed.length)} />
                  <Kpi
                    label="Assiduité"
                    value={`${studentData.rate} %`}
                    hint="sur la journée de démo"
                  />
                </div>
              )}

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.srOnly}>
                    Historique de présence de {selectedStudent.nom}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Jour</th>
                      <th scope="col">Cours</th>
                      <th scope="col">Heure</th>
                      <th scope="col">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentData.history.map((item) => (
                      <tr key={item.entry.id}>
                        <td>{formatDay(item.entry.scanned_at)}</td>
                        <td>{item.course}</td>
                        <td>{formatTime(item.entry.scanned_at)}</td>
                        <td>
                          <StatusBadge present />
                        </td>
                      </tr>
                    ))}
                    {studentData.history.length === 0 ? (
                      <tr>
                        <td colSpan={4} className={styles.empty}>
                          Aucun scan enregistré pour cet élève.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {studentData.courses.length > 0 ? (
                studentData.missed.length > 0 ? (
                  <div className={styles.missed}>
                    <p className={styles.missedLabel}>Cours sans scan</p>
                    <ul className={styles.chips}>
                      {studentData.missed.map((course) => (
                        <li key={course.id} className={styles.chip}>
                          {course.nom}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className={styles.footnote}>Aucun cours manqué sur la journée de démo.</p>
                )
              ) : null}
            </>
          ) : null}
        </section>

        <footer className={styles.footer}>
          <span>Maquette Sprint 0 · dashboard direction</span>
          <span>Aucun appel réseau · données fictives</span>
        </footer>
      </div>
    </main>
  );
}

const JOURS = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
];

function formatTimeSlot(course: Course): string {
  return `${JOURS[course.jour_semaine]} ${course.heure_debut}–${course.heure_fin}`;
}
