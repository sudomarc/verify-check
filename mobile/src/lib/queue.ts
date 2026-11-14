/**
 * File d'attente hors ligne du scanner mobile — logique pure (testée sans RN).
 * Le stockage persistant (AsyncStorage) est injecté : ce module ne sait rien
 * de React Native. Chaque entrée a un identifiant unique ; le doublon serveur
 * est un CONFIRMEMENT, un rejet définitif est marqué `rejete`.
 */

export type FileItem = {
  id: string;
  code_qr: string;
  cours: string;
  salle?: string;
  /** Heure locale ISO du scan (au moment du geste agent). */
  at: string;
  etat: "en_attente" | "confirme" | "rejete";
  note?: string;
  essais: number;
};

export type FileStore = {
  load(): Promise<FileItem[]>;
  save(items: FileItem[]): Promise<void>;
};

/** Rejets métier définitifs (jamais réessayables). */
const REJETS_DEFINITIFS = new Set([
  "qr_invalide",
  "pas_de_cours",
  "cours_ambigu",
  "salle_invalide",
  "cours_pas_actif",
]);

export function nouvelleEntree(
  id: string,
  scan: { code_qr: string; cours: string; salle?: string; at: string }
): FileItem {
  return {
    id,
    code_qr: scan.code_qr.toUpperCase(),
    cours: scan.cours,
    salle: scan.salle,
    at: scan.at,
    etat: "en_attente",
    essais: 0,
  };
}

/** Anti-doublon local : ce code est-il déjà EN ATTENTE pour ce cours ? */
export function dejaEnAttente(items: FileItem[], codeQr: string, cours: string): boolean {
  const code = codeQr.toUpperCase();
  return items.some(
    (i) => i.etat === "en_attente" && i.code_qr === code && i.cours === cours
  );
}

/** Charge, puis applique une transformation pure sur la file et la persiste. */
export async function mettreAJour(
  store: FileStore,
  transform: (items: FileItem[]) => FileItem[]
): Promise<FileItem[]> {
  const items = transform(await store.load());
  await store.save(items);
  return items;
}

/** Compte des pointages EN ATTENTE (badge réseau de l'UI). */
export function nombreEnAttente(items: FileItem[]): number {
  return items.filter((i) => i.etat === "en_attente").length;
}

/**
 * Synchronise la file : rejoue chaque pointage EN ATTENTE via `replay`.
 * - `confirme` (201) ou `doublon` serveur → CONFIRMÉ ;
 * - rejet définitif → REJETÉ (restera visible, jamais perdu) ;
 * - autre erreur / réseau perdu → reste EN ATTENTE (essais+1) et on arrête.
 */
export async function synchroniser(
  items: FileItem[],
  replay: (item: FileItem) => Promise<"confirme" | "doublon" | "rejete_definitif" | "reessayer">
): Promise<{ items: FileItem[]; synchronises: number }> {
  let synchronises = 0;
  let stop = false;
  const out: FileItem[] = [];
  for (const item of items) {
    if (item.etat !== "en_attente" || stop) {
      out.push(item);
      continue;
    }
    const result = await replay(item);
    if (result === "confirme" || result === "doublon") {
      out.push({
        ...item,
        etat: "confirme",
        note: result === "doublon" ? "doublon confirmé par le serveur" : "",
      });
      synchronises++;
    } else if (result === "rejete_definitif") {
      out.push({ ...item, etat: "rejete" });
    } else {
      out.push({ ...item, essais: item.essais + 1 });
      stop = true; // réseau perdu : on arrête proprement, la file reste intacte
    }
  }
  return { items: out, synchronises };
}

/** Le rejet métier renvoyé par le serveur est-il définitif ? */
export function estRejetDefinitif(erreur?: string): boolean {
  return REJETS_DEFINITIFS.has(erreur ?? "");
}
