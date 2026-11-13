import { test } from "node:test";
import assert from "node:assert/strict";
import { buildAbsencesCsv, csvEscape } from "../src/lib/csv.ts";

// Vendredi 2026-11-13 (jour_semaine 5)
const date = "2026-11-13";
const weekday = 5;

const classes = [
  { id: "cl-1", nom: "10e A" },
  { id: "cl-2", nom: "11e B" },
];
const courses = [
  { id: "co-math", nom: "Mathématiques", classe_id: "cl-1", jour_semaine: 5, heure_fin: "09:00" },
  { id: "co-hist", nom: "Histoire, géo", classe_id: "cl-1", jour_semaine: 1, heure_fin: "11:00" }, // autre jour
  { id: "co-phys", nom: 'Physique "labo"', classe_id: "cl-2", jour_semaine: 5, heure_fin: "09:00" },
];
const students = [
  { id: "st-1", nom: "Alpha Barry", classe_id: "cl-1" },
  { id: "st-2", nom: "Fatou Camara", classe_id: "cl-1" },
  { id: "st-3", nom: "Ibrahima Diallo", classe_id: "cl-2" },
];

test("csvEscape échappe les guillemets", () => {
  assert.equal(csvEscape('Physique "labo"'), '"Physique ""labo"""');
  assert.equal(csvEscape("Alpha Barry"), '"Alpha Barry"');
});

test("buildAbsencesCsv : une ligne d'absence par élève × cours terminé", () => {
  const csv = buildAbsencesCsv(
    { classes, courses, students, attendance: [] },
    { date, weekday }
  );
  const lines = csv.replace(/^\uFEFF/, "").split("\r\n");
  assert.deepEqual(lines, [
    '"date","eleve","classe","cours","statut"',
    `"${date}","Alpha Barry","10e A","Mathématiques","absent"`,
    `"${date}","Fatou Camara","10e A","Mathématiques","absent"`,
    `"${date}","Ibrahima Diallo","11e B","Physique ""labo""","absent"`,
  ]);
  assert.ok(csv.startsWith("\uFEFF"), "BOM UTF-8 attendu en tête du fichier");
});

test("buildAbsencesCsv : les élèves scannés ne sont pas absents", () => {
  const csv = buildAbsencesCsv(
    {
      classes,
      courses,
      students,
      attendance: [{ student_id: "st-1", course_id: "co-math" }],
    },
    { date, weekday }
  );
  assert.ok(!csv.includes("Alpha Barry"), "élève présent, pas de ligne d'absence");
  assert.ok(csv.includes("Fatou Camara"));
});

test("buildAbsencesCsv : filtre classe", () => {
  const csv = buildAbsencesCsv(
    { classes, courses, students, attendance: [] },
    { date, weekday, classe: "cl-2" }
  );
  assert.ok(csv.includes("Ibrahima Diallo"));
  assert.ok(!csv.includes("Alpha Barry"));
  assert.ok(!csv.includes("Fatou Camara"));
});

test("buildAbsencesCsv : aucun cours prévu → en-tête seul", () => {
  const csv = buildAbsencesCsv(
    { classes, courses, students, attendance: [] },
    { date: "2026-11-15", weekday: 0 } // dimanche
  );
  assert.equal(csv.replace(/^\uFEFF/, ""), '"date","eleve","classe","cours","statut"');
});

test("buildAbsencesCsv : le jour même, un cours pas encore terminé n'est pas absent", () => {
  const enCours = { id: "co-now", nom: "Cours en cours", classe_id: "cl-1", jour_semaine: 5, heure_fin: "17:00" };
  const termine = { id: "co-done", nom: "Cours terminé", classe_id: "cl-1", jour_semaine: 5, heure_fin: "09:00" };
  const csv = buildAbsencesCsv(
    { classes, courses: [enCours, termine], students, attendance: [] },
    { date, weekday, now: { jour: date, heure: "10:30" } }
  );
  assert.ok(!csv.includes("Cours en cours"), "cours non terminé → pas d'absence déclarée");
  assert.ok(csv.includes("Cours terminé"), "cours terminé sans scan → absent");
});

test("buildAbsencesCsv : une date passée déclare tous les cours absents", () => {
  const csv = buildAbsencesCsv(
    { classes, courses, students, attendance: [] },
    { date: "2026-11-12", weekday: 4, now: { jour: date, heure: "10:30" } }
  );
  // jeudi 12/11 : aucun cours planifié ce jour dans les fixtures → en-tête seul
  assert.equal(csv.replace(/^\uFEFF/, ""), '"date","eleve","classe","cours","statut"');
});

test("buildAbsencesCsv : heure_fin inconnue → on ne déclare pas absent", () => {
  const inconnu = { id: "co-x", nom: "Heure inconnue", classe_id: "cl-1", jour_semaine: 5 };
  const csv = buildAbsencesCsv(
    { classes, courses: [inconnu], students, attendance: [] },
    { date, weekday, now: { jour: date, heure: "10:30" } }
  );
  assert.equal(csv.replace(/^\uFEFF/, ""), '"date","eleve","classe","cours","statut"');
});
