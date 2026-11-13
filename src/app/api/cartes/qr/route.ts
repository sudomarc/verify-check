import { NextResponse, type NextRequest } from "next/server";
import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
  createServerSupabase,
  requireAdmin,
  setSessionCookies,
} from "@/lib/auth";
import QRCode from "qrcode";

/**
 * GET /api/cartes/qr?code=… — rendu PNG du QR d'une carte élève (usage serveur
 * de la lib `qrcode`, jamais dans le bundle client). Auth admin requise :
 * le code d'une carte est une donnée élève minimisée mais non publique.
 */
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(SESSION_COOKIE)?.value;
  const auth = await requireAdmin(accessToken, request.cookies.get(REFRESH_COOKIE)?.value);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const code = request.nextUrl.searchParams.get("code")?.trim();
  if (!code || code.length > 64) {
    return NextResponse.json({ error: "code_invalide" }, { status: 400 });
  }

  try {
    const buffer = await QRCode.toBuffer(code, {
      margin: 1,
      width: 220,
      errorCorrectionLevel: "M",
    });
    const response = new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=3600",
      },
    });
    if (auth.session) setSessionCookies(response, auth.session);
    return response;
  } catch {
    return NextResponse.json({ error: "qr_generation" }, { status: 500 });
  }
}
