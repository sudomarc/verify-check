import { test } from "node:test";
import assert from "node:assert/strict";
import { selectCourse } from "../src/lib/scan.ts";

const coursA = {
  id: "co-a",
  nom: "Mathématiques",
  salle: "B12",
  jour_semaine: 5,
  heure_debut: "08:00",
  heure_fin: "09:00",
};
const coursB = {
  id: "co-b",
  nom: "Physique",
  salle: null,
  jour_semaine: 5,
  heure_debut: "08:00",
  heure_fin: "09:00",
};

test("selectCourse sans salle : premier cours actif de la classe", () => {
  const r = selectCourse([coursA, coursB]);
  assert.ok(r.ok);
  assert.equal(r.ok ? r.course.id : "", "co-a");
});

test("selectCourse avec salle correspondante", () => {
  const r = selectCourse([coursA, coursB], "B12");
  assert.ok(r.ok);
  assert.equal(r.ok ? r.course.id : "", "co-a");
});

test("selectCourse avec salle inconnue : salle_invalide", () => {
  const r = selectCourse([coursA, coursB], "ZZ99");
  assert.ok(!r.ok);
  assert.equal(r.ok ? "" : r.error, "salle_invalide");
  assert.equal(r.ok ? "" : r.salle, "ZZ99");
});

test("selectCourse : cours sans salle ne matche pas une salle déclarée", () => {
  const r = selectCourse([coursB], "B12");
  assert.ok(!r.ok);
});

test("selectCourse : liste vide sans salle renvoie ok (géré en amont par pas_de_cours)", () => {
  const r = selectCourse([]);
  assert.equal(r.ok, true);
});
