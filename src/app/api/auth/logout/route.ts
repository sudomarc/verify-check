import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_COOKIE, SESSION_COOKIE, revokeSession } from "@/lib/auth";

/**
 * POST /api/auth/logout — invalide la session côté Supabase (refresh token
 * révoqué par GoTrue) puis supprime les cookies httpOnly du navigateur.
 * Idempotent : sans session, répond ok et supprime quand même les cookies.
 */
export async function POST(request: NextRequest) {
  await revokeSession(
    request.cookies.get(SESSION_COOKIE)?.value,
    request.cookies.get(REFRESH_COOKIE)?.value
  );
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
