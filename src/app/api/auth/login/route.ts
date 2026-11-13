import { NextResponse, type NextRequest } from "next/server";
import {
  createServerSupabase,
  setSessionCookies,
  supabaseAnonKey,
  supabaseUrl,
} from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/auth/login — connexion admin (email + mot de passe).
 * Rejette tout compte dont `app_metadata.role` n'est pas `admin`.
 * Pose des cookies httpOnly (access + refresh) utilisés par le middleware et les endpoints.
 */

export async function POST(request: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "corps_invalide" }, { status: 400 });
  }
  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ error: "champs_requis" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.user || !data.session) {
    return NextResponse.json({ error: "identifiants_invalides" }, { status: 401 });
  }

  const role = (data.user.app_metadata as Record<string, unknown> | undefined)?.role;
  if (role !== "admin") {
    // Session créée mais rôle insuffisant : on la termine immédiatement.
    await supabase.auth.signOut().catch(() => {});
    return NextResponse.json({ error: "role_admin_requis" }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  setSessionCookies(response, data.session);
  return response;
}
