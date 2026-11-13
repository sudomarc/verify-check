-- VerifyCheck — MVP schema (v1 corrigé, Sprint 0)
-- À exécuter manuellement dans l'éditeur SQL Supabase après validation humaine.
-- Principe : minimisation des données élèves (pas de photo, pas d'email),
-- RLS stricte réservée aux admins, fuseau scolaire Africa/Conakry.

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
  -- créneau hebdomadaire : jour + heure début/fin (heure locale Africa/Conakry)
  jour_semaine int not null check (jour_semaine between 0 and 6), -- 0 = dimanche
  heure_debut time not null,
  heure_fin time not null
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  scanned_at timestamptz not null default now()   -- horodatage serveur (timestamptz), pas client
);

-- Anti-doublon : index UNIQUE d'expression sur élève + cours + journée locale Africa/Conakry.
-- scanned_at (timestamptz) est converti en heure locale Conakry puis on extrait la date scolaire.
-- Pas de contrainte UNIQUE sur expression : on utilise un index unique d'expression.
create unique index attendance_one_per_student_course_conakry_day_idx
  on attendance (student_id, course_id, date(scanned_at AT TIME ZONE 'Africa/Conakry'));

create index attendance_course_idx on attendance (course_id, scanned_at);
create index students_classe_idx on students (classe_id);  -- vues dashboard par classe

-- RLS activé sur toutes les tables
alter table classes enable row level security;
alter table students enable row level security;
alter table courses enable row level security;
alter table attendance enable row level security;

-- Privilèges SQL : seuls les rôles authentifiés peuvent toucher les tables (nécessaire pour que RLS
-- puisse s'appliquer via une session admin). Aucun droit n'est accordé au rôle anon (scanner inclus).
grant select, insert, update, delete on classes to authenticated;
grant select, insert, update, delete on students to authenticated;
grant select, insert, update, delete on courses to authenticated;
grant select, insert, update, delete on attendance to authenticated;
revoke all on classes from anon;
revoke all on students from anon;
revoke all on courses from anon;
revoke all on attendance from anon;

-- Policies réservées aux admins authentifiés : app_metadata.role = 'admin' (jamais user_metadata).
-- Remplacement des anciennes policies permissives "using (true) with check (true)".
create policy "admin full access classes" on classes
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin full access students" on students
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin full access courses" on courses
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admin full access attendance" on attendance
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Aucune policy pour anon : les tables sont invisibles sans session admin authentifiée.
-- Le scanner utilise la session admin du poste tablette (login une fois par salle).
-- Aucun droit administrateur n'est accordé au scanner.
