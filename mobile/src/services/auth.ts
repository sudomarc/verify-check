/**
 * Session d'authentification admin de l'app mobile.
 * Supabase Auth natif (email + mot de passe) — le rôle admin est vérifié côté
 * serveur (`app_metadata.role`), et chaque appel API porte le JWT en Bearer.
 * Les tokens sont persistés par supabase-js dans AsyncStorage (rn mode).
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient, type Session } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";
import { getConfig } from "../lib/configStore";

let client: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!client) {
    const cfg = getConfig();
    client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage as never,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

export type LoginResult =
  | { ok: true; email: string }
  | { ok: false; error: "identifiants" | "reseau" | "role" | "champs" };

/** Connexion admin. Le rôle est revérifié par chaque endpoint serveur (RLS). */
export async function login(email: string, password: string): Promise<LoginResult> {
  if (!email.trim() || !password) return { ok: false, error: "champs" };
  try {
    const { data, error } = await supabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error || !data.session) return { ok: false, error: "identifiants" };
    return { ok: true, email: data.user.email ?? email.trim() };
  } catch {
    return { ok: false, error: "reseau" };
  }
}

export async function logout(): Promise<void> {
  await supabase().auth.signOut().catch(() => {});
}

export async function session(): Promise<Session | null> {
  try {
    const { data } = await supabase().auth.getSession();
    return data.session;
  } catch {
    return null;
  }
}

/** JWT courant (Authorization: Bearer) — null si session absente/expirée. */
export async function accessToken(): Promise<string | null> {
  const s = await session();
  return s?.access_token ?? null;
}
