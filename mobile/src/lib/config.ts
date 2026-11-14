/**
 * Configuration de l'app mobile VerifyCheck.
 * Toute configuration vient de l'environnement (variables `EXPO_PUBLIC_*`) :
 * aucun identifiant codé en dur. Les variables `EXPO_PUBLIC_*` sont publiques
 * par nature (incluses dans le bundle client) — ne jamais y mettre un secret.
 */

const REQUIRED = ["EXPO_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_ANON_KEY"] as const;

export type AppConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  /** Base des endpoints API (dashboard web Next.js). Sans slash final. */
  apiBaseUrl: string;
};

export function readConfig(env: Record<string, string | undefined>): AppConfig {
  const missing = REQUIRED.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(
      "Configuration manquante : " + missing.join(", ") + " (voir mobile/.env.example)"
    );
  }
  const supabaseUrl = (env.EXPO_PUBLIC_SUPABASE_URL as string).trim();
  if (!/^https?:\/\//.test(supabaseUrl)) {
    throw new Error("EXPO_PUBLIC_SUPABASE_URL doit être une URL http(s) valide");
  }
  const apiBaseUrl = (env.EXPO_PUBLIC_API_BASE_URL ?? supabaseUrl.replace(/\/$/, ""))
    .trim()
    .replace(/\/$/, "");
  return {
    supabaseUrl,
    supabaseAnonKey: (env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string).trim(),
    apiBaseUrl,
  };
}
