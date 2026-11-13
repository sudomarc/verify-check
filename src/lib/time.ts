/**
 * Journée scolaire en heure locale Africa/Conakry (GMT+0, pas d'heure d'été).
 * Toutes les dates de planning et d'anti-doublon utilisent ce fuseau.
 */

export const SCHOOL_TIME_ZONE = "Africa/Conakry";

const dateTimeFormatter = new Intl.DateTimeFormat("fr-CA", {
  timeZone: SCHOOL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  weekday: "short",
  hour12: false,
});

/** 0 = dimanche … 6 = samedi (même convention que courses.jour_semaine). */
const WEEKDAY_BY_LABEL: Record<string, number> = {
  dim: 0,
  lun: 1,
  mar: 2,
  mer: 3,
  jeu: 4,
  ven: 5,
  sam: 6,
};

export type SchoolInstant = {
  /** Date locale Conakry, format YYYY-MM-DD. */
  jour: string;
  /** Heure locale Conakry, format HH:mm. */
  heure: string;
  /** Jour de semaine local Conakry (0 = dimanche). */
  jourSemaine: number;
};

export function schoolInstant(at: Date = new Date()): SchoolInstant {
  const parts = dateTimeFormatter.formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const jour = `${get("year")}-${get("month")}-${get("day")}`;
  const heure = `${get("hour")}:${get("minute")}`;
  const weekdayLabel = get("weekday").slice(0, 3).toLowerCase();
  const jourSemaine = WEEKDAY_BY_LABEL[weekdayLabel];
  return { jour, heure, jourSemaine };
}

/** Compare "HH:mm" de façon numérique. */
export function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Vrai si l'instant est dans le créneau du cours (bornes incluses). */
export function isCourseActive(
  heureDebut: string,
  heureFin: string,
  now: SchoolInstant
): boolean {
  const t = minutesOf(now.heure);
  return t >= minutesOf(heureDebut) && t <= minutesOf(heureFin);
}
