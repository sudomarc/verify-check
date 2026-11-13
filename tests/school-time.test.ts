import { test } from "node:test";
import assert from "node:assert/strict";
import { isCourseActive, minutesOf, schoolInstant } from "../src/lib/time.ts";

test("schoolInstant calcule la journée locale Conakry", () => {
  // Conakry = GMT+0 : 2026-11-13T08:30Z → vendredi 13/11 08:30
  const instant = schoolInstant(new Date("2026-11-13T08:30:00.000Z"));
  assert.equal(instant.jour, "2026-11-13");
  assert.equal(instant.heure, "08:30");
  assert.equal(instant.jourSemaine, 5); // vendredi
});

test("schoolInstant sur un instant tardif reste le même jour Conakry", () => {
  const instant = schoolInstant(new Date("2026-11-13T23:59:00.000Z"));
  assert.equal(instant.jour, "2026-11-13");
  assert.equal(instant.jourSemaine, 5);
});

test("schoolInstant au changement de jour passe au jour suivant", () => {
  const instant = schoolInstant(new Date("2026-11-13T00:00:30.000Z"));
  assert.equal(instant.jour, "2026-11-13");
  assert.equal(instant.heure, "00:00");
});

test("minutesOf décompose HH:mm", () => {
  assert.equal(minutesOf("08:00"), 480);
  assert.equal(minutesOf("17:45"), 1065);
});

test("isCourseActive inclut les bornes du créneau", () => {
  const cours = { debut: "08:00", fin: "09:00" };
  assert.ok(isCourseActive(cours.debut, cours.fin, { jour: "2026-11-13", heure: "08:00", jourSemaine: 5 }));
  assert.ok(isCourseActive(cours.debut, cours.fin, { jour: "2026-11-13", heure: "09:00", jourSemaine: 5 }));
  assert.ok(!isCourseActive(cours.debut, cours.fin, { jour: "2026-11-13", heure: "09:01", jourSemaine: 5 }));
  assert.ok(!isCourseActive(cours.debut, cours.fin, { jour: "2026-11-13", heure: "07:59", jourSemaine: 5 }));
});
