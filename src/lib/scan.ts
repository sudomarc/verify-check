/**
 * Sélection du cours au scan (Sprint 2) — logique pure, testable sans base.
 * Le portique peut déclarer sa salle : on filtre les cours actifs sur celle-ci.
 */

export type SlotCourse = {
  id: string;
  nom: string;
  salle: string | null;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
};

export type CourseSelection =
  | { ok: true; course: SlotCourse }
  | { ok: false; error: "salle_invalide"; salle: string };

/**
 * Choisit le cours parmi les cours actifs de la classe :
 * - sans `salle` : le premier cours actif ;
 * - avec `salle` : le cours actif de cette salle, sinon `salle_invalide`.
 */
export function selectCourse(
  slotCourses: SlotCourse[],
  salle?: string
): CourseSelection {
  if (!salle) {
    return { ok: true, course: slotCourses[0] };
  }
  const match = slotCourses.find((c) => c.salle === salle);
  if (!match) {
    return { ok: false, error: "salle_invalide", salle };
  }
  return { ok: true, course: match };
}
