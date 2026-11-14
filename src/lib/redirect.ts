/**
 * Cible de redirection sûre après connexion (paramètre `next`).
 * N'accepte qu'un chemin interne : rejette les URL absolues et
 * protocol-relative (`//evil.com`) pour empêcher un open redirect.
 */
export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}
