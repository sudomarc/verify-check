-- VerifyCheck — MVP schema (v1)
-- À exécuter manuellement dans le SQL Editor Supabase après validation humaine.
-- Principe : minimisation des données élèves (pas de photo, pas d'email).

create table classes (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique
);

create table students (
  id uuid primary key default gen_random_uuid(),
  code_qr text not null unique,          -- identifiant encodé dans le QR de la carte
  nom text not null,
  classe_id uuid not null references classes(id) on delete restrict
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  classe_id uuid not null references classes(id) on delete cascade,
  salle text,                            -- association scan → salle (flux Sprint 2)
  -- créneau hebdomadaire : jour + heure début/fin (UTC simplifié au MVP)
  jour_semaine int not null check (jour_semaine between 0 and 6), -- 0 = dimanche
  heure_debut time not null,
  heure_fin time not null
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  scanned_at timestamptz not null default now(),   -- horodatage serveur, pas client
  unique (student_id, course_id, date(scanned_at))  -- anti-doublon : 1 scan par jour/cours
);

create index attendance_course_idx on attendance (course_id, scanned_at);
create index students_classe_idx on students (classe_id);  -- vues dashboard par classe

-- RLS : base stricte. Lecture/écriture réservées aux admins authentifiés.
alter table classes enable row level security;
alter table students enable row level security;
alter table courses enable row level security;
alter table attendance enable row level security;

create policy "admin full access classes" on classes
  for all to authenticated using (true) with check (true);
create policy "admin full access students" on students
  for all to authenticated using (true) with check (true);
create policy "admin full access courses" on courses
  for all to authenticated using (true) with check (true);
create policy "admin full access attendance" on attendance
  for all to authenticated using (true) with check (true);

-- Aucune policy pour anon : les tables sont invisibles sans session admin.
-- La page de scan utilise la session admin du poste tablette (login une fois par salle).
