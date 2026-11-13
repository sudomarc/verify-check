import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Helpers d'authentification côté serveur (Sprint 1 — Auth admin).
 *
 * Principe de sécurité :
 * - la session admin est stockée dans des cookies httpOnly (access/refresh JWT) ;
 * - tout endpoint sensible vérifie le JWT auprès de Supabase (`auth.getUser`) ;
 * - le rôle admin est lu dans `app_metadata` (jamais `user_metadata`) ;
 * - RLS + policies SQL restreignent les données au rôle admin côté base.
 */

export const SESSION_COOKIE = "vc_access";
export const REFRESH_COOKIE = "vc_refresh";

export function supabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL manquante");
  return url;
}

export function supabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY manquante");
  return key;
}

/** Client Supabase côté serveur, optionnellement porteur du JWT d'un utilisateur. */
export function createServerSupabase(accessToken?: string): SupabaseClient {
  return createClient(supabaseUrl(), supabaseAnonKey(), {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined,
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type AuthUser = {
  id: string;
  email: string | null;
};

/** Vérifie le JWT auprès de Supabase et exige le rôle admin dans app_metadata. */
export async function requireAdmin(
  accessToken?: string | null
): Promise<{ ok: true; user: AuthUser } | { ok: false; status: 401; error: string }> {
  if (!accessToken) {
    return { ok: false, status: 401, error: "session_requise" };
  }
  const supabase = createServerSupabase(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) {
    return { ok: false, status: 401, error: "session_invalide" };
  }
  const role = (data.user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== "admin") {
    return { ok: false, status: 401, error: "role_admin_requis" };
  }
  return {
    ok: true,
    user: { id: data.user.id, email: data.user.email ?? null },
  };
}
