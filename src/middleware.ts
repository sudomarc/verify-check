import { NextResponse, type NextRequest } from "next/server";
import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
  createServerSupabase,
  isAdminRole,
  setSessionCookies,
} from "@/lib/auth";

/**
 * Protection des routes admin (Sprint 1).
 * - `/dashboard` et `/scan` exigent une session admin valide ;
 * - le JWT est vérifié auprès de Supabase (pas une simple présence de cookie) ;
 * - si l'access token est expiré, la session est renouvelée via le refresh
 *   token (cookie 8 h) et les cookies sont ré-écrits (rotation) ;
 * - les endpoints `/api/**` gèrent leur propre auth (401 JSON).
 */

const PROTECTED_PAGES = ["/dashboard", "/scan"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPage = PROTECTED_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtectedPage) return NextResponse.next();

  const accessToken = request.cookies.get(SESSION_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!accessToken) return redirectToLogin(request);

  // Vérification réseau du JWT auprès de Supabase (source de vérité).
  const supabase = createServerSupabase(accessToken);
  const { data, error } = await supabase.auth.getUser(accessToken);
  let user = data?.user;
  let rotated: { access_token: string; refresh_token: string } | undefined;

  if ((error || !user) && refreshToken) {
    // Access token expiré → renouvellement silencieux (access + refresh tournés).
    const refreshed = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    if (!refreshed.error && refreshed.data?.session && refreshed.data.user) {
      rotated = {
        access_token: refreshed.data.session.access_token,
        refresh_token: refreshed.data.session.refresh_token,
      };
      user = refreshed.data.user;
    }
  }

  if (!user || !isAdminRole(user as { app_metadata?: Record<string, unknown> })) {
    return redirectToLogin(request);
  }

  const response = NextResponse.next();
  if (rotated) setSessionCookies(response, rotated);
  return response;
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/scan/:path*"],
};
