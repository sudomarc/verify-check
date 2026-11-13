import { test } from "node:test";
import assert from "node:assert/strict";
import { selectCourse } from "../src/lib/scan.ts";
import type { SlotCourse } from "../src/lib/scan.ts";

const coursA: SlotCourse = {
  id: "co-a",
  nom: "Mathématiques",
  salle: "B12",
  jour_semaine: 5,
  heure_debut: "08:00",
  heure_fin: "09:00",
};
const coursB: SlotCourse = {
  id: "co-b",
  nom: "Physique",
  salle: null,
  jour_semaine: 5,
  heure_debut: "08:00",
  heure_fin: "09:00",
};

test("selectCourse : un seul cours actif sans indice → retenu sans ambiguïté", () => {
  const r = selectCourse([coursB]);
  assert.ok(r.ok);
  assert.equal(r.ok ? r.course.id : "", "co-b");
});

test("selectCourse : plusieurs cours actifs sans indice → cours_ambigu (jamais de choix arbitraire)", () => {
  const r = selectCourse([coursA, coursB]);
  assert.ok(!r.ok);
  assert.equal(r.ok ? "" : r.error, "cours_ambigu");
  assert.equal(r.ok ? 0 : (r as { candidates?: unknown[] }).candidates!.length, 2);
});

test("selectCourse avec salle correspondante", () => {
  const r = selectCourse([coursA, coursB], { salle: "B12" });
  assert.ok(r.ok);
  assert.equal(r.ok ? r.course.id : "", "co-a");
});

test("selectCourse avec salle inconnue : salle_invalide", () => {
  const r = selectCourse([coursA, coursB], { salle: "ZZ99" });
  assert.ok(!r.ok);
  assert.equal(r.ok ? "" : r.error, "salle_invalide");
  assert.equal(r.ok ? "" : (r as { salle?: string }).salle, "ZZ99");
});

test("selectCourse : cours explicite présent dans les cours actifs", () => {
  const r = selectCourse([coursA, coursB], { cours: "co-b" });
  assert.ok(r.ok);
  assert.equal(r.ok ? r.course.id : "", "co-b");
});

test("selectCourse : cours explicite hors des cours actifs → cours_pas_actif", () => {
  const r = selectCourse([coursA], { cours: "co-zzz" });
  assert.ok(!r.ok);
  assert.equal(r.ok ? "" : r.error, "cours_pas_actif");
});

test("selectCourse : cours sans salle ne matche pas une salle déclarée", () => {
  const r = selectCourse([coursB], { salle: "B12" });
  assert.ok(!r.ok);
});

test("selectCourse : liste vide sans salle renvoie ok (géré en amont par pas_de_cours)", () => {
  const r = selectCourse([]);
  assert.equal(r.ok, true);
});
