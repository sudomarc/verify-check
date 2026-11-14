/**
 * Store du scanner mobile : orchestration pointage + file hors ligne.
 * La logique pure vit dans `lib/queue.ts` (testée sans React Native) ; ce
 * module n'ajoute que l'adaptateur AsyncStorage et les appels API.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  dejaEnAttente,
  nouvelleEntree,
  nombreEnAttente,
  synchroniser,
  type FileItem,
  type FileStore,
} from "../lib/queue";
import type { ScanEtat } from "../lib/scanStatus";
import { pointer, rejouerPointage } from "../services/api";

/** Alias public : type des entrées locales d'historique. */
export type LocalItem = FileItem;

const KEY = "vc.mobile.queue.v1";

const asyncStore: FileStore = {
  async load() {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as FileItem[]) : [];
    } catch {
      return [];
    }
  },
  async save(items) {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* quota : la file reste en mémoire pour la session */
    }
  },
};

const uid = () =>
  "m-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

/**
 * Pointage depuis l'écran scan.
 * États renvoyés : confirmée | doublon | qr_invalide | pas_de_cours |
 * cours_ambigu | salle_invalide | session_expiree | erreur_serveur |
 * hors_ligne (mis en file, EN ATTENTE) | deja_en_attente.
 */
export async function enregistrerScan(
  codeQr: string,
  selection: { coursId: string; coursNom: string; salle?: string }
): Promise<ScanEtat> {
  const etat = await pointer(codeQr, selection);

  if (etat.kind === "hors_ligne" || etat.kind === "erreur_serveur") {
    const items = await asyncStore.load();
    if (dejaEnAttente(items, codeQr, selection.coursId)) {
      return { kind: "deja_en_attente" };
    }
    const entry = nouvelleEntree(uid(), {
      code_qr: codeQr,
      cours: selection.coursId,
      salle: selection.salle,
      at: new Date().toISOString(),
    });
    await asyncStore.save([...items, entry]);
    emitChange();
    return { kind: "hors_ligne", fileId: entry.id };
  }
  return etat;
}

/** Synchronise la file au retour du réseau / à l'ouverture de l'app. */
export async function synchroniserFile(): Promise<number> {
  const items = await asyncStore.load();
  if (nombreEnAttente(items) === 0) return 0;
  const { items: next, synchronises } = await synchroniser(items, rejouerPointage);
  await asyncStore.save(next);
  emitChange();
  return synchronises;
}

/** Compteur EN ATTENTE (badge réseau de l'UI). */
export async function enAttente(): Promise<number> {
  return nombreEnAttente(await asyncStore.load());
}

/** Derniers pointages (historique local, états explicites). */
export async function historique(): Promise<FileItem[]> {
  const items = await asyncStore.load();
  return items.slice().reverse().slice(0, 20);
}

const listeners = new Set<() => void>();
function emitChange() {
  listeners.forEach((fn) => fn());
}
export function onFileChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
