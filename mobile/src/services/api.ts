/**
 * Client API de l'app mobile — réutilise les endpoints du backend Next.js
 * existants (aucune logique métier dupliquée) :
 *   GET  /api/scan/context   — classes + cours du jour (Conakry)
 *   GET  /api/dashboard      — compteur réel du cours
 *   POST /api/scan           — pointage (validation serveur)
 * Session : `Authorization: Bearer <jwt>` Supabase (les cookies web ne
 * s'appliquent pas à React Native).
 */

import { accessToken } from "./auth";
import { mapScanResponse, type ScanEtat } from "../lib/scanStatus";
import type { FileItem } from "../lib/queue";
import { getConfig } from "../lib/configStore";

async function api<T>(path: string, init?: RequestInit): Promise<{ status: number; body: T | null }> {
  const token = await accessToken();
  const url = getConfig().apiBaseUrl + path;
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": "application/json",
    },
  });
  let body: T | null = null;
  try {
    body = (await res.json()) as T;
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

export type Contexte = {
  jour: string;
  heure: string;
  classes: Array<{ id: string; nom: string }>;
  cours: Array<{
    id: string;
    nom: string;
    classe_id: string;
    salle: string | null;
    heure_debut: string;
    heure_fin: string;
    actif: boolean;
  }>;
};

export async function getContexte(): Promise<
  { ok: true; data: Contexte } | { ok: false; error: "session" | "reseau" | "serveur" }
> {
  try {
    const { status, body } = await api<Contexte>("/api/scan/context");
    if (status === 401) return { ok: false, error: "session" };
    if (status !== 200 || !body) return { ok: false, error: "serveur" };
    return { ok: true, data: body };
  } catch {
    return { ok: false, error: "reseau" };
  }
}

export type DashboardData = {
  date: string;
  effectif: number;
  presents: number;
  scans: number;
  cours_prevus: Array<{ id: string; nom: string; heure_debut: string; heure_fin: string }>;
  eleves: Array<{
    id: string;
    nom: string;
    code_qr: string;
    presences: Array<{ course_id: string; scanned_at: string }>;
  }>;
};

export async function getDashboard(
  classeId?: string
): Promise<{ ok: true; data: DashboardData } | { ok: false; error: "session" | "reseau" | "serveur" }> {
  try {
    const query = classeId ? `?classe=${encodeURIComponent(classeId)}` : "";
    const { status, body } = await api<DashboardData>("/api/dashboard" + query);
    if (status === 401) return { ok: false, error: "session" };
    if (status !== 200 || !body) return { ok: false, error: "serveur" };
    return { ok: true, data: body };
  } catch {
    return { ok: false, error: "reseau" };
  }
}

/**
 * Pointage réel. Ne renvoie jamais « confirmée » sans réponse serveur :
 * - réponse 201 → confirmée ;
 * - réseau indisponible / erreur serveur → `hors_ligne` (mis en file EN ATTENTE).
 */
export async function pointer(
  codeQr: string,
  selection: { coursId: string; coursNom: string; salle?: string }
): Promise<ScanEtat> {
  const payload = {
    code_qr: codeQr.toUpperCase(),
    cours: selection.coursId,
    ...(selection.salle ? { salle: selection.salle } : {}),
  };
  try {
    const { status, body } = await api<Parameters<typeof mapScanResponse>[1]>("/api/scan", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const etat = mapScanResponse(status, body);
    if (etat.kind === "erreur_serveur") {
      // non persisté ici : l'écran décide de la mise en file (voir store/scan.ts)
      return etat;
    }
    return etat;
  } catch {
    return { kind: "hors_ligne", fileId: "" }; // fileId renseigné par le store
  }
}

/** Rejoue un pointage en file (synchronisation). */
export async function rejouerPointage(item: FileItem): Promise<"confirme" | "doublon" | "rejete_definitif" | "reessayer"> {
  try {
    const payload = {
      code_qr: item.code_qr,
      cours: item.cours,
      ...(item.salle ? { salle: item.salle } : {}),
    };
    const { status, body } = await api<Parameters<typeof mapScanResponse>[1]>("/api/scan", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (status === 201) return "confirme";
    const err = (body as { error?: string } | null)?.error;
    if (err === "doublon") return "doublon";
    // Aligné sur le contrat serveur : seul qr_invalide est un rejet définitif.
    if (err === "qr_invalide") return "rejete_definitif";
    return "reessayer";
  } catch {
    return "reessayer";
  }
}
