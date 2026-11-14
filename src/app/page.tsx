import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VerifyCheck — Présence scolaire par QR code",
  description:
    "Suivi de présence scolaire par QR code : scan en salle et tableau de bord direction.",
};

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5rem",
    padding: "2rem",
    background: "#faf7f0",
    color: "#1c2733",
  },
  card: {
    width: "min(520px, 92vw)",
    background: "#fffdf8",
    border: "1px solid #dcd5c8",
    borderRadius: 12,
    padding: "2rem",
  },
  eyebrow: { margin: 0, color: "#5b6b7c", fontSize: ".8rem", letterSpacing: ".05em", textTransform: "uppercase" },
  title: { margin: ".25rem 0 .5rem", fontSize: "1.5rem" },
  lead: { margin: "0 0 1.25rem", color: "#5b6b7c", lineHeight: 1.5 },
  actions: { display: "flex", flexWrap: "wrap", gap: ".75rem" },
  primary: {
    padding: ".7rem 1.1rem",
    borderRadius: 8,
    background: "#14604a",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
  },
  secondary: {
    padding: ".7rem 1.1rem",
    borderRadius: 8,
    border: "1px solid #dcd5c8",
    color: "#1c2733",
    textDecoration: "none",
    fontWeight: 600,
  },
};

export default function Home() {
  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>VerifyCheck</p>
        <h1 style={styles.title}>Présence scolaire par QR code</h1>
        <p style={styles.lead}>
          Les élèves pointent leur carte à l&apos;entrée du cours ; la direction
          consulte la présence réelle par classe, cours et élève.
        </p>
        <div style={styles.actions}>
          <Link href="/scanner/" style={styles.primary}>
            Scanner de salle
          </Link>
          <Link href="/login" style={styles.secondary}>
            Espace direction
          </Link>
        </div>
      </div>
    </main>
  );
}
