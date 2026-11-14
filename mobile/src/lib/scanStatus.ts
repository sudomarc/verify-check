/**
 * Mapping d'une réponse de `POST /api/scan` vers un état métier affichable.
 * Règle absolue : aucun état « confirmé » tant que le serveur n'a pas répondu.
 * Partagé entre l'app mobile et testé sans React Native (node:test).
 */

export type ScanApiStatus = 200 | 201 | 400 | 401 | 403 | 404 | 409 | 500 | number;

export type ScanEtat =
  | { kind: "confirmee"; eleve?: string; cours?: string }
  | { kind: "doublon" }
  | { kind: "qr_invalide" }
  | { kind: "pas_de_cours"; heure?: string }
  | { kind: "cours_ambigu"; candidates: Array<{ id: string; nom: string; salle: string | null }> }
  | { kind: "salle_invalide"; salle?: string }
  | { kind: "session_expiree" }
  | { kind: "erreur_serveur" }
  | { kind: "hors_ligne"; fileId: string }
  | { kind: "deja_en_attente" };

export type ScanApiBody = {
  ok?: boolean;
  error?: string;
  eleve?: string;
  cours?: string;
  heure?: string;
  salle?: string;
  candidates?: Array<{ id: string; nom: string; salle: string | null }>;
};

/** Erreurs métier définitives : jamais mises en file d'attente hors ligne. */
const REJETS_DEFINITIFS = new Set([
  "qr_invalide",
  "pas_de_cours",
  "cours_ambigu",
  "salle_invalide",
  "cours_pas_actif",
]);

export function mapScanResponse(
  httpStatus: ScanApiStatus,
  body: ScanApiBody | null
): ScanEtat {
  const err = body?.error;
  if (httpStatus === 201) {
    return { kind: "confirmee", eleve: body?.eleve, cours: body?.cours };
  }
  if (err === "doublon") return { kind: "doublon" };
  if (err === "qr_invalide") return { kind: "qr_invalide" };
  if (err === "pas_de_cours") return { kind: "pas_de_cours", heure: body?.heure };
  if (err === "cours_ambigu") return { kind: "cours_ambigu", candidates: body?.candidates ?? [] };
  if (err === "salle_invalide" || err === "cours_pas_actif") {
    return { kind: "salle_invalide", salle: body?.salle };
  }
  if (httpStatus === 401 || err === "session_requise" || err === "session_invalide") {
    return { kind: "session_expiree" };
  }
  return { kind: "erreur_serveur" };
}

/** Faut-il mettre le pointage en file d'attente hors ligne après cette réponse ? */
export function doitMettreEnFile(etat: ScanEtat): boolean {
  if (
    etat.kind === "confirmee" ||
    etat.kind === "doublon" ||
    etat.kind === "session_expiree" ||
    etat.kind === "hors_ligne" ||
    etat.kind === "deja_en_attente"
  ) {
    return false;
  }
  if (REJETS_DEFINITIFS.has(etat.kind)) return false;
  // erreur_serveur → en file : le pointage reste EN ATTENTE, réessayable,
  // jamais perdu ni jamais présenté comme confirmé.
  return true;
}
