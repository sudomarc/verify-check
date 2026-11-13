"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./Dashboard.module.css";

/**
 * Dashboard direction — données RÉELLES via GET /api/dashboard.
 * Distinction métier : présent (scan serveur) / non pointé (cours non terminé)
 * / absent (cours terminé sans scan). Jamais de mock en production.
 */

const TIME_ZONE = "Africa/Conakry";

type Classe = { id: string; nom: string };
type Cours = {
  id: string;
  nom: string;
  classe_id: string;
  salle: string | null;
  heure_debut: string;
  heure_fin: string;
};
type Eleve = {
  id: string;
  nom: string;
  code_qr: string;
  classe_id: string;
  scans: number;
  presences: Array<{ course_id: string; scanned_at: string }>;
};
type DashboardData = {
  date: string;
  jour_semaine: number;
  classes: Classe[];
  cours_prevus: Cours[];
  effectif: number;
  presents: number;
  scans: number;
  eleves: Eleve[];
};

type Vue = "general" | "classes" | "cours" | "eleves" | "cartes";

const VUES: { id: Vue; label: string }[] = [
  { id: "general", label: "Vue générale" },
  { id: "classes", label: "Classes" },
  { id: "cours", label: "Cours" },
  { id: "eleves", label: "Élèves" },
  { id: "cartes", label: "Cartes QR" },
];

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});

const dateLabelFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: TIME_ZONE,
});

function todayConakry(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function nowMinutesConakry(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}

function minutesOf(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Statut métier d'un élève pour un cours, à l'heure Conakry actuelle. */
type Statut = "present" | "non-pointe" | "absent";
function statutEleve(eleve: Eleve, cours: Cours, date: string): Statut {
  const present = eleve.presences.some((p) => p.course_id === cours.id);
  if (present) return "present";
  const termine =
    date < todayConakry() ||
    (date === todayConakry() && minutesOf(cours.heure_fin) <= nowMinutesConakry());
  return termine ? "absent" : "non-pointe";
}

const STATUT_LABEL: Record<Statut, string> = {
  present: "PRÉSENT",
  "non-pointe": "NON POINTÉ",
  absent: "ABSENT",
};

function statutClass(statut: Statut, s: Record<string, string>): string {
  const key = statut === "non-pointe" ? "nonPointe" : statut;
  return `${styles.pastille} ${s[key] ?? ""}`;
}

export default function DashboardClient() {
  const [vue, setVue] = useState<Vue>("general");
  const [date, setDate] = useState(todayConakry());
  const [classe, setClasse] = useState<string>("");
  const [cours, setCours] = useState<string>("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [classeNom, setClasseNom] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ date });
    if (classe) params.set("classe", classe);
    if (cours) params.set("cours", cours);
    try {
      const res = await fetch(`/api/dashboard?${params.toString()}`, { credentials: "same-origin" });
      if (res.status === 401) {
        window.location.href = "/login?next=%2Fdashboard";
        return;
      }
      if (!res.ok) {
        setError(res.status === 400 ? "Date invalide." : "Erreur serveur — réessaie.");
        setData(null);
      } else {
        const body = (await res.json()) as DashboardData;
        setData(body);
        setClasseNom(
          classe ? (body.classes.find((c) => c.id === classe)?.nom ?? "") : ""
        );
      }
    } catch {
      setError("Réseau indisponible.");
    } finally {
      setLoading(false);
    }
  }, [date, classe, cours]);

  useEffect(() => {
    load();
  }, [load]);

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams({ date });
    if (classe) params.set("classe", classe);
    return `/api/dashboard/export?${params.toString()}`;
  }, [date, classe]);

  const classeLabel = (id: string) => data?.classes.find((c) => c.id === id)?.nom ?? "—";
  const eleveParClasse = useMemo(
    () => (data?.eleves ?? []).filter((e) => !classe || e.classe_id === classe),
    [data, classe]
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <div className={styles.brand}>VerifyCheck</div>
          <p className={styles.subtitle}>
            {dateLabelFormatter.format(new Date(`${date}T12:00:00Z`))} · {TIME_ZONE}
          </p>
        </div>
        <div className={styles.filters}>
          <label>
            Date
            <input type="date" value={date} max={todayConakry()} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Classe
            <select value={classe} onChange={(e) => { setClasse(e.target.value); setCours(""); }}>
              <option value="">Toutes</option>
              {(data?.classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </label>
          <label>
            Cours
            <select value={cours} onChange={(e) => setCours(e.target.value)}>
              <option value="">Tous</option>
              {(data?.cours_prevus ?? [])
                .filter((c) => !classe || c.classe_id === classe)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} {timeFormatter.format(new Date(`2000-01-01T${c.heure_debut}Z`))}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </header>

      <nav className={styles.nav} aria-label="Sections">
        {VUES.map((v) => (
          <button
            key={v.id}
            className={vue === v.id ? styles.navOn : ""}
            onClick={() => setVue(v.id)}
            aria-current={vue === v.id ? "page" : undefined}
          >
            {v.label}
          </button>
        ))}
      </nav>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {loading && <p className={styles.loading}>Chargement des données réelles…</p>}

      {data && !loading && (
        <main className={styles.main}>
          {/* ---------------------------------------------- VUE GÉNÉRALE */}
          {vue === "general" && (
            <>
              <section className={styles.resume}>
                <div>
                  <span className={styles.kpi}>{data.cours_prevus.length}</span>
                  <span className={styles.kpiLabel}>cours prévus</span>
                </div>
                <div>
                  <span className={styles.kpi}>{data.effectif}</span>
                  <span className={styles.kpiLabel}>élèves concernés</span>
                </div>
                <div>
                  <span className={styles.kpi}>{data.presents}</span>
                  <span className={styles.kpiLabel}>présents (≥ 1 scan)</span>
                </div>
                <div>
                  <span className={styles.kpi}>{data.scans}</span>
                  <span className={styles.kpiLabel}>scans serveur</span>
                </div>
              </section>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Classe</th><th>Cours</th><th>Salle</th><th>Heure</th>
                    <th>Présents</th><th>Absents (cours terminé)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cours_prevus.map((c) => {
                    const eleves = eleveParClasse.filter((e) => e.classe_id === c.classe_id);
                    const statuts = eleves.map((e) => statutEleve(e, c, date));
                    return (
                      <tr key={c.id}>
                        <td>{classeLabel(c.classe_id)}</td>
                        <td>{c.nom}</td>
                        <td>{c.salle ?? "—"}</td>
                        <td className={styles.num}>
                          {c.heure_debut.slice(0, 5)}–{c.heure_fin.slice(0, 5)}
                        </td>
                        <td className={styles.num}>
                          {statuts.filter((s) => s === "present").length}/{eleves.length}
                        </td>
                        <td className={styles.num}>
                          {statuts.filter((s) => s === "absent").length}
                        </td>
                      </tr>
                    );
                  })}
                  {data.cours_prevus.length === 0 && (
                    <tr><td colSpan={6} className={styles.empty}>Aucun cours prévu ce jour.</td></tr>
                  )}
                </tbody>
              </table>

              <p className={styles.actionsRow}>
                <a className={styles.button} href={exportUrl}>Exporter les absences (CSV)</a>
              </p>
            </>
          )}

          {/* ------------------------------------------------ CLASSES */}
          {vue === "classes" && (
            <table className={styles.table}>
              <thead>
                <tr><th>Classe</th><th>Élèves</th><th>Présents aujourd&apos;hui</th><th>Cours prévus</th></tr>
              </thead>
              <tbody>
                {data.classes.map((c) => {
                  const eleves = data.eleves.filter((e) => e.classe_id === c.id);
                  const coursClasse = data.cours_prevus.filter((k) => k.classe_id === c.id);
                  const presents = eleves.filter((e) =>
                    coursClasse.some((k) => e.presences.some((p) => p.course_id === k.id))
                  ).length;
                  return (
                    <tr key={c.id}>
                      <td>{c.nom}</td>
                      <td className={styles.num}>{eleves.length}</td>
                      <td className={styles.num}>{presents}</td>
                      <td className={styles.num}>{coursClasse.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* -------------------------------------------------- COURS */}
          {vue === "cours" && (
            <table className={styles.table}>
              <thead>
                <tr><th>Cours</th><th>Classe</th><th>Heure</th><th>Salle</th><th>Présents</th></tr>
              </thead>
              <tbody>
                {data.cours_prevus.map((c) => {
                  const eleves = data.eleves.filter(
                    (e) => (!classe || e.classe_id === classe) && e.classe_id === c.classe_id
                  );
                  const presents = eleves.filter((e) => e.presences.some((p) => p.course_id === c.id));
                  return (
                    <tr key={c.id}>
                      <td>{c.nom}</td>
                      <td>{classeLabel(c.classe_id)}</td>
                      <td className={styles.num}>
                        {c.heure_debut.slice(0, 5)}–{c.heure_fin.slice(0, 5)}
                      </td>
                      <td>{c.salle ?? "—"}</td>
                      <td className={styles.num}>{presents.length}/{eleves.length}</td>
                    </tr>
                  );
                })}
                {data.cours_prevus.length === 0 && (
                  <tr><td colSpan={5} className={styles.empty}>Aucun cours prévu ce jour.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* -------------------------------------------------- ÉLÈVES */}
          {vue === "eleves" && (
            <table className={styles.table}>
              <thead>
                <tr><th>Élève</th><th>Classe</th><th>Code carte</th><th>Scans</th><th>Détail des cours</th></tr>
              </thead>
              <tbody>
                {eleveParClasse.map((e) => (
                  <tr key={e.id}>
                    <td>{e.nom}</td>
                    <td>{classeLabel(e.classe_id)}</td>
                    <td className={styles.code}>{e.code_qr}</td>
                    <td className={styles.num}>{e.scans}</td>
                    <td>
                      {data.cours_prevus
                        .filter((c) => c.classe_id === e.classe_id)
                        .map((c) => {
                          const statut = statutEleve(e, c, date);
                          return (
                            <span key={c.id} className={statutClass(statut, styles as Record<string, string>)}>
                              {c.nom} : {STATUT_LABEL[statut]}
                            </span>
                          );
                        })}
                    </td>
                  </tr>
                ))}
                {eleveParClasse.length === 0 && (
                  <tr><td colSpan={5} className={styles.empty}>Aucun élève pour ce filtre.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* -------------------------------------------------- CARTES */}
          {vue === "cartes" && (
            <CartesQR eleves={eleveParClasse} classeLabel={classeLabel} classeNom={classeNom} />
          )}
        </main>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ Cartes QR */

function CartesQR({
  eleves,
  classeLabel,
  classeNom,
}: {
  eleves: Eleve[];
  classeLabel: (id: string) => string;
  classeNom: string;
}) {
  // QR générés côté serveur (`GET /api/cartes/qr`, lib `qrcode` hors bundle client).
  // Même origine : les cookies de session admin accompagnent les images.
  return (
    <section>
      <p className={styles.actionsRow}>
        <button className={styles.button} onClick={() => window.print()}>
          Imprimer la planche ({eleves.length} cartes)
        </button>
      </p>
      <h2 className={styles.printTitle}>{classeNom ? `Cartes — ${classeNom}` : "Cartes — toutes les classes"}</h2>
      <div className={styles.cards}>
        {eleves.map((e) => (
          <article key={e.id} className={styles.card}>
            <div className={styles.cardHead}>
              <span className={styles.cardBrand}>VerifyCheck</span>
              <span className={styles.cardClasse}>{classeLabel(e.classe_id)}</span>
            </div>
            <div className={styles.cardBody}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/cartes/qr?code=${encodeURIComponent(e.code_qr)}`}
                alt={`QR de ${e.nom}`}
                width={110}
                height={110}
              />
              <div>
                <div className={styles.cardNom}>{e.nom}</div>
                <div className={styles.cardCode}>{e.code_qr}</div>
              </div>
            </div>
          </article>
        ))}
        {eleves.length === 0 && <p className={styles.empty}>Aucun élève pour ce filtre.</p>}
      </div>
    </section>
  );
}
