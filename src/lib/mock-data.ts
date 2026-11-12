// VerifyCheck — données de démonstration (mock)
//
// Objectif : débloquer les écrans (scan, dashboard, carte élève) sans dépendre
// de Supabase. Aucune donnée réelle : noms fictifs, identifiants déterministes.
// Miroir de supabase/schema.sql (v1) — à supprimer quand l'API réelle existe.

export type Classe = {
  id: string;
  nom: string;
};

export type Student = {
  id: string;
  code_qr: string;
  nom: string;
  classe_id: string;
};

export type Course = {
  id: string;
  nom: string;
  classe_id: string;
  /** 0 = dimanche … 6 = samedi (cf. schema.sql) */
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
};

export type Attendance = {
  id: string;
  student_id: string;
  course_id: string;
  /** Horodatage ISO 8601 (côté serveur dans la vraie app) */
  scanned_at: string;
};

export const mockClasses: Classe[] = [
  { id: "11111111-1111-4111-8111-111111111101", nom: "6ème A" },
  { id: "11111111-1111-4111-8111-111111111102", nom: "5ème B" },
];

export const mockStudents: Student[] = [
  {
    id: "22222222-2222-4222-8222-222222222201",
    code_qr: "VC-6A-0001",
    nom: "Fatoumata Diallo",
    classe_id: mockClasses[0].id,
  },
  {
    id: "22222222-2222-4222-8222-222222222202",
    code_qr: "VC-6A-0002",
    nom: "Mamadou Camara",
    classe_id: mockClasses[0].id,
  },
  {
    id: "22222222-2222-4222-8222-222222222203",
    code_qr: "VC-6A-0003",
    nom: "Aïssatou Barry",
    classe_id: mockClasses[0].id,
  },
  {
    id: "22222222-2222-4222-8222-222222222204",
    code_qr: "VC-6A-0004",
    nom: "Ibrahima Sow",
    classe_id: mockClasses[0].id,
  },
  {
    id: "22222222-2222-4222-8222-222222222205",
    code_qr: "VC-5B-0001",
    nom: "Kadiatou Keïta",
    classe_id: mockClasses[1].id,
  },
  {
    id: "22222222-2222-4222-8222-222222222206",
    code_qr: "VC-5B-0002",
    nom: "Ousmane Condé",
    classe_id: mockClasses[1].id,
  },
  {
    id: "22222222-2222-4222-8222-222222222207",
    code_qr: "VC-5B-0003",
    nom: "Mariam Touré",
    classe_id: mockClasses[1].id,
  },
  {
    id: "22222222-2222-4222-8222-222222222208",
    code_qr: "VC-5B-0004",
    nom: "Alpha Bah",
    classe_id: mockClasses[1].id,
  },
];

export const mockCourses: Course[] = [
  {
    id: "33333333-3333-4333-8333-333333333301",
    nom: "Mathématiques",
    classe_id: mockClasses[0].id,
    jour_semaine: 1,
    heure_debut: "08:00",
    heure_fin: "10:00",
  },
  {
    id: "33333333-3333-4333-8333-333333333302",
    nom: "Français",
    classe_id: mockClasses[0].id,
    jour_semaine: 1,
    heure_debut: "10:15",
    heure_fin: "12:15",
  },
  {
    id: "33333333-3333-4333-8333-333333333303",
    nom: "Sciences",
    classe_id: mockClasses[1].id,
    jour_semaine: 2,
    heure_debut: "08:00",
    heure_fin: "10:00",
  },
  {
    id: "33333333-3333-4333-8333-333333333304",
    nom: "Anglais",
    classe_id: mockClasses[1].id,
    jour_semaine: 2,
    heure_debut: "10:15",
    heure_fin: "12:15",
  },
];

// Scans du lundi 2026-11-09 (cours de Mathématiques et de Français en 6ème A).
export const mockAttendance: Attendance[] = [
  {
    id: "44444444-4444-4444-8444-444444444401",
    student_id: mockStudents[0].id,
    course_id: mockCourses[0].id,
    scanned_at: "2026-11-09T08:02:11.000Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444402",
    student_id: mockStudents[1].id,
    course_id: mockCourses[0].id,
    scanned_at: "2026-11-09T08:02:35.000Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444403",
    student_id: mockStudents[3].id,
    course_id: mockCourses[0].id,
    scanned_at: "2026-11-09T08:03:02.000Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444404",
    student_id: mockStudents[0].id,
    course_id: mockCourses[1].id,
    scanned_at: "2026-11-09T10:16:40.000Z",
  },
  {
    id: "44444444-4444-4444-8444-444444444405",
    student_id: mockStudents[2].id,
    course_id: mockCourses[1].id,
    scanned_at: "2026-11-09T10:17:05.000Z",
  },
];

/** Élèves d'une classe (maquette dashboard). */
export function getStudentsByClasse(classeId: string): Student[] {
  return mockStudents.filter((student) => student.classe_id === classeId);
}

/** Cours d'une classe (maquette dashboard / scan). */
export function getCoursesByClasse(classeId: string): Course[] {
  return mockCourses.filter((course) => course.classe_id === classeId);
}

/** Présences d'un cours, triées par horodatage. */
export function getAttendanceByCourse(courseId: string): Attendance[] {
  return mockAttendance
    .filter((entry) => entry.course_id === courseId)
    .sort((a, b) => a.scanned_at.localeCompare(b.scanned_at));
}

/** Retrouve un élève par le code encodé dans son QR (maquette scan). */
export function findStudentByQrCode(code: string): Student | undefined {
  return mockStudents.find((student) => student.code_qr === code);
}
