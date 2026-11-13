import { NextResponse } from "next/server";
import { REFRESH_COOKIE, SESSION_COOKIE } from "@/lib/auth";

/** POST /api/auth/logout — supprime les cookies de session admin. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}
