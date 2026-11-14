import { NextResponse, type NextRequest } from "next/server";
import {
  REFRESH_COOKIE,
  SESSION_COOKIE,
  requestAccessToken,
  createServerSupabase,
  requireAdmin,
  setSessionCookies,
} from "@/lib/auth";
import { isCourseActive, schoolInstant } from "@/lib/time";

/**
 * GET /api/scan/context — contexte de pointage de l'agent :
 * classes, cours du jour scolaire (Conakry) avec heures et statut actif.
 * Source de l'écran « contexte » de la PWA. Auth admin requise.
 */
export async function GET(request: NextRequest) {
  const accessToken = requestAccessToken(request);
  const auth = await requireAdmin(accessToken, request.cookies.get(REFRESH_COOKIE)?.value);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const supabase = createServerSupabase(auth.session?.access_token ?? accessToken);
  const now = schoolInstant();
  const [classesRes, coursesRes] = await Promise.all([
    supabase.from("classes").select("id, nom").order("nom"),
    supabase
      .from("courses")
      .select("id, nom, classe_id, salle, jour_semaine, heure_debut, heure_fin")
      .eq("jour_semaine", now.jourSemaine)
      .order("heure_debut"),
  ]);
  if (classesRes.error || coursesRes.error) {
    return NextResponse.json({ error: "erreur_base" }, { status: 500 });
  }

  const courses = (coursesRes.data ?? []) as Array<{
    id: string;
    nom: string;
    classe_id: string;
    salle: string | null;
    heure_debut: string;
    heure_fin: string;
  }>;

  const response = NextResponse.json({
    jour: now.jour,
    heure: now.heure,
    fuseau: "Africa/Conakry",
    classes: classesRes.data ?? [],
    cours: courses.map((c) => ({
      ...c,
      actif: isCourseActive(c.heure_debut, c.heure_fin, now),
    })),
  });
  if (auth.session) setSessionCookies(response, auth.session);
  return response;
}
