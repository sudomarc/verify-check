"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeNext } from "@/lib/redirect";

const ERROR_LABELS: Record<string, string> = {
  identifiants_invalides: "Email ou mot de passe incorrect.",
  role_admin_requis: "Ce compte n'a pas le rôle administrateur.",
  champs_requis: "Renseignez l'email et le mot de passe.",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "erreur" }));
        setError(ERROR_LABELS[body.error] ?? "Connexion impossible.");
        return;
      }
      router.replace(next);
    } catch {
      setError("Réseau indisponible. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={styles.card} aria-label="Connexion administrateur">
      <p style={styles.eyebrow}>VerifyCheck · Direction</p>
      <h1 style={styles.title}>Connexion administrateur</h1>
      <label htmlFor="email" style={styles.label}>
        Email
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      <label htmlFor="password" style={styles.label}>
        Mot de passe
      </label>
      <input
        id="password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      {error ? (
        <p role="alert" style={styles.error}>
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} style={styles.button}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    width: "min(360px, 90vw)",
    background: "#fff",
    borderRadius: 12,
    padding: "2rem",
    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
    display: "flex",
    flexDirection: "column",
    gap: ".5rem",
  },
  eyebrow: { margin: 0, color: "#6b7280", fontSize: ".8rem" },
  title: { margin: "0 0 1rem", fontSize: "1.25rem" },
  label: { fontSize: ".85rem", color: "#374151" },
  input: {
    padding: ".6rem .75rem",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: "1rem",
  },
  error: {
    margin: 0,
    color: "#b91c1c",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: ".5rem .75rem",
    fontSize: ".85rem",
  },
  button: {
    marginTop: "1rem",
    padding: ".65rem",
    borderRadius: 8,
    border: "none",
    background: "#111827",
    color: "#fff",
    fontSize: "1rem",
    cursor: "pointer",
  },
};
