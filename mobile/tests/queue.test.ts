import { test } from "node:test";
import assert from "node:assert/strict";
import {
  nouvelleEntree,
  dejaEnAttente,
  nombreEnAttente,
  synchroniser,
  estRejetDefinitif,
  type FileItem,
  type FileStore,
} from "../src/lib/queue.ts";

function storeVirtuel(initial: FileItem[] = []): { store: FileStore; items: FileItem[] } {
  const items = initial;
  return {
    items,
    store: {
      async load() {
        return items.slice();
      },
      async save(next) {
        items.length = 0;
        items.push(...next);
      },
    },
  };
}

const scan = { code_qr: "vc-001", cours: "co-1", salle: "B12", at: "2026-11-14T08:05:00Z" };

test("nouvelleEntree : code normalisé en majuscules, état EN ATTENTE", () => {
  const e = nouvelleEntree("id-1", scan);
  assert.equal(e.code_qr, "VC-001");
  assert.equal(e.etat, "en_attente");
});

test("dejaEnAttente : anti-doublon local par code + cours", () => {
  const e = nouvelleEntree("id-1", scan);
  assert.ok(dejaEnAttente([e], "vc-001", "co-1"));
  assert.ok(!dejaEnAttente([e], "vc-002", "co-1"));
  assert.ok(!dejaEnAttente([e], "vc-001", "co-2"));
  const confirme: FileItem = { ...e, etat: "confirme" };
  assert.ok(!dejaEnAttente([confirme], "vc-001", "co-1"));
});

test("nombreEnAttente", () => {
  const e = nouvelleEntree("id-1", scan);
  assert.equal(nombreEnAttente([e, { ...e, id: "id-2", etat: "confirme" }]), 1);
});

test("synchroniser : doublon serveur = confirmé (pas une erreur)", async () => {
  const e = nouvelleEntree("id-1", scan);
  const { items, synchronises } = await synchroniser([e], async () => "doublon");
  assert.equal(synchronises, 1);
  assert.equal(items[0].etat, "confirme");
  assert.ok(items[0].note?.includes("doublon"));
});

test("synchroniser : rejet définitif → rejeté, visible, jamais perdu", async () => {
  const e = nouvelleEntree("id-1", scan);
  const { items, synchronises } = await synchroniser([e], async () => "rejete_definitif");
  assert.equal(synchronises, 0);
  assert.equal(items[0].etat, "rejete");
});

test("synchroniser : réseau perdu → reste EN ATTENTE et arrête la file", async () => {
  const a = nouvelleEntree("id-1", scan);
  const b = nouvelleEntree("id-2", { ...scan, code_qr: "VC-002" });
  let appels = 0;
  const { items, synchronises } = await synchroniser([a, b], async () => {
    appels++;
    return "reessayer";
  });
  assert.equal(synchronises, 0);
  assert.equal(appels, 1, "on s'arrête après la première perte réseau");
  assert.equal(items[0].essais, 1);
  assert.equal(items[0].etat, "en_attente");
  assert.equal(items[1].essais, 0, "l'entrée suivante n'est pas consommée");
});

test("synchroniser : les entrées déjà confirmées/rejetées ne sont pas rejouées", async () => {
  const a: FileItem = { ...nouvelleEntree("id-1", scan), etat: "confirme" };
  const rejete: FileItem = { ...nouvelleEntree("id-2", scan), etat: "rejete" };
  const enAttente = nouvelleEntree("id-3", { ...scan, code_qr: "VC-003" });
  let appels = 0;
  const { synchronises } = await synchroniser([a, rejete, enAttente], async () => {
    appels++;
    return "confirme";
  });
  assert.equal(appels, 1);
  assert.equal(synchronises, 1);
});

test("estRejetDefinitif : seul qr_invalide (contrat serveur, maintenance cycle 1)", () => {
  assert.ok(estRejetDefinitif("qr_invalide"));
  assert.ok(!estRejetDefinitif("cours_pas_actif"));
  assert.ok(!estRejetDefinitif("pas_de_cours"));
  assert.ok(!estRejetDefinitif("salle_invalide"));
  assert.ok(!estRejetDefinitif("doublon"));
  assert.ok(!estRejetDefinitif(undefined));
});

test("FileStore : persistance via l'adaptateur injecté", async () => {
  const s = storeVirtuel();
  const e = nouvelleEntree("id-1", scan);
  await s.store.save([e]);
  const reloaded = await s.store.load();
  assert.equal(reloaded.length, 1);
  assert.equal(reloaded[0].id, "id-1");
});
