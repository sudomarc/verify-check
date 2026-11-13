import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, createServerSupabase } from "@/lib/auth";

/**
 * Protection des routes admin (Sprint 1).
 * - `/dashboard` et `/scan` exigent une session admin valide ;
 * - le JWT est vérifié auprès de Supabase (pas une simple présence de cookie) ;
 * - les endpoints `/api/**` gèrent leur propre auth (401 JSON).
 */

const PROTECTED_PAGES = ["/dashboard", "/scan"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPage = PROTECTED_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtectedPage) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return redirectToLogin(request);

  // Vérification réseau du JWT auprès de Supabase (source de vérité).
  const supabase = createServerSupabase(token);
  const { data, error } = await supabase.auth.getUser(token);
  const user = data?.user;
  const role = (user?.app_metadata as Record<string, unknown> | undefined)?.role;
  if (error || !user || role !== "admin") return redirectToLogin(request);

  return NextResponse.next();
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
