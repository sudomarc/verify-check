import { test } from "node:test";
import assert from "node:assert/strict";
import { mapScanResponse, doitMettreEnFile } from "../src/lib/scanStatus.ts";

test("mapScanResponse : 201 → confirmée avec élève et cours", () => {
  const etat = mapScanResponse(201, { ok: true, eleve: "Alpha Barry", cours: "Mathématiques" });
  assert.equal(etat.kind, "confirmee");
  assert.ok(etat.kind === "confirmee" && etat.eleve === "Alpha Barry");
});

test("mapScanResponse : doublon, QR invalide, pas de cours", () => {
  assert.equal(mapScanResponse(409, { error: "doublon" }).kind, "doublon");
  assert.equal(mapScanResponse(404, { error: "qr_invalide" }).kind, "qr_invalide");
  const pdc = mapScanResponse(404, { error: "pas_de_cours", heure: "10:30" });
  assert.ok(pdc.kind === "pas_de_cours" && pdc.heure === "10:30");
});

test("mapScanResponse : ambiguïté conservée avec les candidats (jamais de choix arbitraire)", () => {
  const etat = mapScanResponse(409, {
    error: "cours_ambigu",
    candidates: [{ id: "a", nom: "Maths", salle: "B12" }, { id: "b", nom: "Physique", salle: null }],
  });
  assert.ok(etat.kind === "cours_ambigu" && etat.candidates.length === 2);
});

test("mapScanResponse : session expirée et erreur serveur", () => {
  assert.equal(mapScanResponse(401, { error: "session_requise" }).kind, "session_expiree");
  assert.equal(mapScanResponse(500, { error: "erreur_base" }).kind, "erreur_serveur");
});

test("doitMettreEnFile : uniquement réessayable, jamais rejet définitif ni confirmé (politique en DIRECT)", () => {
  assert.ok(doitMettreEnFile({ kind: "erreur_serveur" }));
  assert.ok(!doitMettreEnFile({ kind: "confirmee" }));
  assert.ok(!doitMettreEnFile({ kind: "doublon" }));
  assert.ok(!doitMettreEnFile({ kind: "session_expiree" }));
  assert.ok(!doitMettreEnFile({ kind: "qr_invalide" }));
  assert.ok(!doitMettreEnFile({ kind: "pas_de_cours", heure: "10:30" }));
  assert.ok(!doitMettreEnFile({ kind: "cours_ambigu", candidates: [] }));
  assert.ok(!doitMettreEnFile({ kind: "salle_invalide" }));
});
