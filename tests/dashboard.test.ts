import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDashboard, dayWindow, isIsoDate, nextDayIso, weekdayOfIso } from "../src/lib/dashboard.ts";
import type { AttendanceRow, CourseRow, StudentRow } from "../src/lib/dashboard.ts";

const classes = [
  { id: "cl-1", nom: "10e A" },
  { id: "cl-2", nom: "11e B" },
];

const courses: CourseRow[] = [
  {
    id: "co-math",
    nom: "Mathématiques",
    classe_id: "cl-1",
    salle: "B12",
    jour_semaine: 5, // vendredi
    heure_debut: "08:00",
    heure_fin: "09:00",
  },
  {
    id: "co-hist",
    nom: "Histoire",
    classe_id: "cl-1",
    salle: null,
    jour_semaine: 1, // lundi
    heure_debut: "10:00",
    heure_fin: "11:00",
  },
  {
    id: "co-phys",
    nom: "Physique",
    classe_id: "cl-2",
    salle: "C3",
    jour_semaine: 5,
    heure_debut: "08:00",
    heure_fin: "09:00",
  },
];

const students: StudentRow[] = [
  { id: "st-1", nom: "Alpha Barry", code_qr: "qr-1", classe_id: "cl-1" },
  { id: "st-2", nom: "Fatou Camara", code_qr: "qr-2", classe_id: "cl-1" },
  { id: "st-3", nom: "Ibrahima Diallo", code_qr: "qr-3", classe_id: "cl-2" },
];

function att(studentId: string, courseId: string, at: string): AttendanceRow {
  return { id: `at-${studentId}-${courseId}`, student_id: studentId, course_id: courseId, scanned_at: at };
}

// 2026-11-13 = vendredi (jour_semaine 5)
const vendredi = "2026-11-13";
const lundi = "2026-11-16";

function base() {
  return { classes, courses, students, attendance: [] as AttendanceRow[] };
}

test("isIsoDate rejette les formats invalides", () => {
  assert.ok(isIsoDate("2026-11-13"));
  assert.ok(!isIsoDate("13/11/2026"));
  assert.ok(!isIsoDate("2026-11-13T08:00"));
  assert.ok(!isIsoDate(""));
});

test("nextDayIso et weekdayOfIso sur des dates UTC", () => {
  assert.equal(nextDayIso("2026-11-13"), "2026-11-14");
  assert.equal(nextDayIso("2026-02-28"), "2026-03-01"); // année non bissextile
  assert.equal(weekdayOfIso(vendredi), 5);
  assert.equal(weekdayOfIso(lundi), 1);
});

test("dayWindow borne la journée scolaire à [00:00, 24:00) UTC", () => {
  const w = dayWindow(vendredi);
  assert.equal(w.startAt, "2026-11-13T00:00:00+00:00");
  assert.equal(w.endAt, "2026-11-14T00:00:00+00:00");
});

test("buildDashboard : planning du jour + résumé", () => {
  const r = buildDashboard(base(), { date: vendredi });
  assert.equal(r.jour_semaine, 5);
  assert.deepEqual(
    r.cours_prevus.map((c) => c.id),
    ["co-math", "co-phys"]
  );
  assert.equal(r.effectif, 3);
  assert.equal(r.presents, 0);
  assert.equal(r.scans, 0);
});

test("buildDashboard : présences comptées, doublon compté comme un scan", () => {
  const raw = {
    ...base(),
    attendance: [
      att("st-1", "co-math", "2026-11-13T08:05:00Z"),
      att("st-1", "co-math", "2026-11-13T08:40:00Z"), // doublon (ne devrait pas exister, mais compté comme scans)
    ],
  };
  const r = buildDashboard(raw, { date: vendredi });
  assert.equal(r.scans, 2);
  assert.equal(r.presents, 1);
  const alpha = r.eleves.find((e) => e.id === "st-1");
  assert.equal(alpha?.scans, 2);
});

test("buildDashboard : les scans hors planning sont ignorés", () => {
  const raw = {
    ...base(),
    attendance: [att("st-1", "co-hist", "2026-11-13T08:05:00Z")], // cours du lundi
  };
  const r = buildDashboard(raw, { date: vendredi });
  assert.equal(r.scans, 0);
  assert.equal(r.presents, 0);
});

test("buildDashboard : filtre classe", () => {
  const r = buildDashboard(base(), { date: vendredi, classe: "cl-2" });
  assert.equal(r.effectif, 1);
  assert.deepEqual(
    r.cours_prevus.map((c) => c.id),
    ["co-phys"]
  );
});

test("buildDashboard : filtre cours et élève", () => {
  const r = buildDashboard(base(), { date: vendredi, cours: "co-math", eleve: "st-2" });
  assert.equal(r.effectif, 1);
  assert.deepEqual(
    r.cours_prevus.map((c) => c.id),
    ["co-math"]
  );
  const fatou = r.eleves.find((e) => e.id === "st-2");
  assert.equal(fatou?.scans, 0);
});

test("buildDashboard : aucun cours prévu ce jour de semaine", () => {
  const r = buildDashboard(base(), { date: "2026-11-15" }); // dimanche
  assert.equal(r.jour_semaine, 0);
  assert.deepEqual(r.cours_prevus, []);
  assert.equal(r.scans, 0);
});
