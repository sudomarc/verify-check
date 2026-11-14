import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { NextResponse } from "next/server";

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

export const ACCESS_COOKIE_MAX_AGE = 60 * 60; // 1 h
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 h — journée scolaire

export type AuthUser = {
  id: string;
  email: string | null;
};

/** Rôle admin lu dans app_metadata (jamais user_metadata). */
export function isAdminRole(user: {
  app_metadata?: Record<string, unknown> | null;
}): boolean {
  return user.app_metadata?.role === "admin";
}

/** Pose (ou renouvelle) les cookies de session admin sur une réponse. */
export function setSessionCookies(
  response: NextResponse,
  session: { access_token: string; refresh_token: string }
) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(SESSION_COOKIE, session.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE,
  });
  response.cookies.set(REFRESH_COOKIE, session.refresh_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_COOKIE_MAX_AGE,
  });
}

/**
 * Extrait le JWT de session d'une requête :
 * - header `Authorization: Bearer <jwt>` (application mobile Supabase) ;
 * - sinon cookie httpOnly `vc_access` (web / PWA).
 */
export function requestAccessToken(request: {
  headers: { get(name: string): string | null };
  cookies: { get(name: string): { value: string } | undefined };
}): string | undefined {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    const token = header.slice(7).trim();
    if (token) return token;
  }
  return request.cookies.get(SESSION_COOKIE)?.value;
}

/**
 * Vérifie le JWT auprès de Supabase et exige le rôle admin dans app_metadata.
 * Si l'access token est expiré mais qu'un refresh token est fourni, la session
 * est renouvelée (`refreshSession`) et la nouvelle session est renvoyée pour
 * que l'appelant ré-écrive les cookies (rotation access + refresh).
 */
export async function requireAdmin(
  accessToken?: string | null,
  refreshToken?: string | null
): Promise<
  | { ok: true; user: AuthUser; session?: { access_token: string; refresh_token: string } }
  | { ok: false; status: 401; error: string }
> {
  if (!accessToken) {
    return { ok: false, status: 401, error: "session_requise" };
  }
  const supabase = createServerSupabase(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);

  let user = data?.user;
  let session: { access_token: string; refresh_token: string } | undefined;

  if ((error || !user) && refreshToken) {
    // Access token expiré/invalide → tentative de renouvellement.
    const refreshed = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (!refreshed.error && refreshed.data?.session && refreshed.data.user) {
      session = {
        access_token: refreshed.data.session.access_token,
        refresh_token: refreshed.data.session.refresh_token,
      };
      user = refreshed.data.user;
    }
  }

  if (!user) {
    return { ok: false, status: 401, error: "session_invalide" };
  }
  if (!isAdminRole(user as { app_metadata?: Record<string, unknown> })) {
    return { ok: false, status: 401, error: "role_admin_requis" };
  }
  return {
    ok: true,
    user: { id: user.id, email: user.email ?? null },
    session,
  };
}

/**
 * Révoque la session côté Supabase (refresh token invalidé) puis délègue
 * la suppression des cookies à l'appelant.
 */
export async function revokeSession(
  accessToken?: string | null,
  refreshToken?: string | null
): Promise<void> {
  if (!accessToken || !refreshToken) return;
  const supabase = createServerSupabase(accessToken);
  await supabase.auth
    .setSession({ access_token: accessToken, refresh_token: refreshToken })
    .then(() => supabase.auth.signOut())
    .catch(() => {});
}
