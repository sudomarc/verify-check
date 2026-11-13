import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, createServerSupabase, requireAdmin } from "@/lib/auth";
import { isCourseActive, schoolInstant } from "@/lib/time";

/**
 * POST /api/scan — Sprint 2 : flux scan → cours actif → écriture attendance.
 * Corps : { code_qr: string, salle?: string }
 *
 * Règles métier (vérifiées côté serveur, l'anti-doublon est garanti par l'index
 * unique d'expression en base : 1 présence par élève, par cours, par jour
 * scolaire Africa/Conakry) :
 * - qr_invalide : code QR inconnu (404) ;
 * - pas_de_cours : aucun cours de la classe active à l'heure Conakry (404) ;
 * - salle_invalide : cours actif mais salle différente de celle du portique (409) ;
 * - doublon : présence déjà enregistrée aujourd'hui pour ce cours (409).
 * Le scanner utilise la session admin du poste tablette (aucun rôle anon).
 */

type CourseRow = {
  id: string;
  nom: string;
  salle: string | null;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
};

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request.cookies.get(SESSION_COOKIE)?.value);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { code_qr?: string; salle?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "corps_invalide" }, { status: 400 });
  }
  const codeQr = body.code_qr?.trim();
  const salle = body.salle?.trim();
  if (!codeQr) {
    return NextResponse.json({ error: "code_qr_requis" }, { status: 400 });
  }

  const supabase = createServerSupabase(request.cookies.get(SESSION_COOKIE)?.value);
  const now = schoolInstant();

  // 1) Élève par code QR
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, nom, classe_id")
    .eq("code_qr", codeQr)
    .single();
  if (studentError || !student) {
    return NextResponse.json({ error: "qr_invalide" }, { status: 404 });
  }

  // 2) Cours actifs de la classe au moment du scan (heure locale Conakry)
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, nom, salle, jour_semaine, heure_debut, heure_fin")
    .eq("classe_id", student.classe_id)
    .eq("jour_semaine", now.jourSemaine);
  if (coursesError) {
    return NextResponse.json({ error: "erreur_base" }, { status: 500 });
  }
  const slotCourses = (courses as CourseRow[] | null ?? []).filter((course) =>
    isCourseActive(course.heure_debut, course.heure_fin, now)
  );
  if (slotCourses.length === 0) {
    return NextResponse.json({ error: "pas_de_cours", jour: now.jour, heure: now.heure }, { status: 404 });
  }

  // 3) Salle du portique : filtre si fournie
  let course = slotCourses[0];
  if (salle) {
    const match = slotCourses.find((c) => c.salle === salle);
    if (!match) {
      return NextResponse.json({ error: "salle_invalide", salle }, { status: 409 });
    }
    course = match;
  }

  // 4) Écriture de la présence — l'index unique garantit 1/jour/cours/élève
  const { data: presence, error: insertError } = await supabase
    .from("attendance")
    .insert({ student_id: student.id, course_id: course.id })
    .select("id, scanned_at")
    .single();
  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "doublon", course: course.nom, jour: now.jour },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "erreur_base" }, { status: 500 });
  }

  return NextResponse.json(
    {
      ok: true,
      eleve: student.nom,
      cours: course.nom,
      presence,
      jour_local: now.jour,
    },
    { status: 201 }
  );
}
