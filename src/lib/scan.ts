/**
 * Sélection du cours au scan (Sprint 2) — logique pure, testable sans base.
 * Règle d'ambiguïté : JAMAIS de choix arbitraire. Si plusieurs cours sont
 * actifs pour la classe et qu'aucune désambiguïsation (salle du portique ou
 * cours explicite) n'est fournie, le pointage est refusé (`cours_ambigu`).
 */

export type SlotCourse = {
  id: string;
  nom: string;
  salle: string | null;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
};

export type CourseHint = { cours?: string; salle?: string };

export type CourseSelection =
  | { ok: true; course: SlotCourse }
  | { ok: false; error: "salle_invalide"; salle: string }
  | { ok: false; error: "cours_pas_actif"; cours: string }
  | { ok: false; error: "cours_ambigu"; candidates: SlotCourse[] };

/**
 * Choisit le cours parmi les cours actifs de la classe :
 * - `cours` explicite : le cours doit être dans les cours actifs ;
 * - `salle` du portique : le cours actif de cette salle ;
 * - un seul cours actif : retenu sans ambiguïté ;
 * - plusieurs cours actifs sans indice : refus explicite `cours_ambigu`.
 */
export function selectCourse(
  slotCourses: SlotCourse[],
  hint?: CourseHint
): CourseSelection {
  const coursId = hint?.cours?.trim() || undefined;
  const salle = hint?.salle?.trim() || undefined;

  if (coursId) {
    const match = slotCourses.find((c) => c.id === coursId);
    if (!match) {
      return { ok: false, error: "cours_pas_actif", cours: coursId };
    }
    return { ok: true, course: match };
  }

  if (salle) {
    const match = slotCourses.find((c) => c.salle === salle);
    if (!match) {
      return { ok: false, error: "salle_invalide", salle };
    }
    return { ok: true, course: match };
  }

  if (slotCourses.length > 1) {
    return { ok: false, error: "cours_ambigu", candidates: slotCourses };
  }
  return { ok: true, course: slotCourses[0] };
}
