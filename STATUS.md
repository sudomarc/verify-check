# STATUS — État des tâches

> **Règle d'usage :**
> 1. Chaque agent/collaborateur, **à la fin de sa session**, met à jour **sa section** (via la PR de sa tâche — jamais de push direct sur `main`) et laisse un handoff clair : ce qui est fait, ce qui ne l'est pas, ce qui bloque.
> 2. Le Rôle 1 (Patrick) met à jour les sections des autres dès qu'une de ses tâches débloque la leur.
> 3. Ce fichier est un **instantané**, pas une source de vérité technique : en cas de doute, se fier au code sur `main` et à `ROADMAP.md`/`TEAM.md`.

**Dernière mise à jour :** 2026-11-13 — Rôle 1 : audit backend (cycle de session, logout serveur, tests, CI) fusionné en PR ; schéma + backend Sprint 1–3 déjà appliqués et vérifiés dans Supabase

---

## Rôle 1 — Backend/DB (Patrick) 🔨 EN COURS
- **Fait et vérifié (Sprint 0 + Sprint 1)** : schéma corrigé appliqué dans le projet Supabase `hdfefhltqyxiqnuruhlp` (verify-check) via CLI — tables `classes`, `students`, `courses`, `attendance` créées, RLS activé sur les 4 tables, policies admin (`app_metadata.role='admin'`, jamais `user_metadata`), privilèges SQL : `authenticated` arwd, `anon` rien. Index unique d'expression `attendance_one_per_student_course_conakry_day_idx` (anti-doublon par jour local `Africa/Conakry`) **testé en base** : doublon même jour rejeté (23505), lendemain accepté, rôle `anon` = permission denied, `authenticated` sans JWT admin = 0 lignes. Données de test créées puis nettoyées (base vierge).
- **Fait (code Sprint 1–3, build vert)** : `src/lib/auth.ts` + `src/middleware.ts` (protection `/dashboard` et `/scan`, JWT vérifié auprès de Supabase), page `/login`, `POST /api/auth/login` (rejet rôle non-admin), `POST /api/auth/logout`, `POST /api/scan` (QR → cours actif Conakry → attendance, erreurs métier : `qr_invalide` / `pas_de_cours` / `salle_invalide` / `doublon`), `GET /api/dashboard` (planning du jour, résumé, présence par classe/cours/élève), `GET /api/dashboard/export` (CSV absences). Vérifié : typecheck OK, `next build` OK, runtime — 401 sans session sur `/api/scan` et `/api/dashboard(/export)`, 307 `/dashboard`→`/login`, 401 sur login bidon.
- **Fait (audit Rôle 1 — PR `fix/backend-audit-sessions-tests`)** : cycle access/refresh token complété (renouvellement automatique via le refresh cookie 8 h dans le middleware et les endpoints protégés, rotation access+refresh ré-écrite en cookies) ; `logout` révoque désormais la session côté Supabase (`signOut` via `setSession`) en plus de supprimer les cookies ; logique métier extraite en fonctions pures (`src/lib/dashboard.ts`, `src/lib/csv.ts`, `src/lib/scan.ts`) et testée — **26 tests `node:test` verts** (`npm test`), dont anti-doublon compté, scans hors planning ignorés, filtres classe/cours/élève, CSV absences (échappement, BOM, filtre), rôles (`app_metadata` seulement), créneaux Conakry ; `npm test` ajouté au workflow CI (`.github/workflows/ci.yml`) ; typecheck + build verts localement.
- **Bloqué sur décision humaine** : création du **compte admin Supabase Auth** (email + mot de passe de la direction + `app_metadata.role='admin'`) — nécessite Patrick ; le parcours login→dashboard→scan bout-en-bout ne peut être vérifié qu'avec ce compte. Les variables d'environnement Vercel (production) sont aussi à configurer par Patrick.
- **Reste Rôle 1** : vérification bout-en-bout scan→présence avec le compte admin (runtime 401/refus re-vérifiable seulement avec une session réelle) ; branchement réel de l'UI dashboard = Rôle 3 ; vérification locale du serveur de dev bloquée dans cet environnement (session Windows agent) — la CI GitHub revalide typecheck + tests + build sur la PR.

## Rôle 2 — Frontend scanner ⏳ EN ATTENTE DU RÔLE 1 (partiel)
- **Débloqué côté backend (Sprint 1–2)** : tables + RLS + policies admin appliquées dans Supabase ; endpoint `POST /api/scan` implémenté (QR → cours actif Conakry → `attendance`, anti-doublon vérifié en base). Reste à vérifier le parcours complet avec le compte admin (décision humaine).
- **Peut faire dès maintenant :** maquette de l'écran scan (Sprint 0, ROADMAP) — rien ne dépend du schéma.
- **Débloqué :** —

## Rôle 3 — Frontend dashboard ⏳ EN ATTENTE (partiel)
- **Débloqué côté backend (Sprint 1 + 3)** : tables + RLS + auth admin (login/middleware) appliquées ; API `GET /api/dashboard` (filtres date/classe/cours/élève, fuseau Conakry) et `GET /api/dashboard/export` (CSV absences) implémentées. L'UI (données réelles, filtres, export) reste à brancher par le Rôle 3.
- **Peut faire dès maintenant :** maquette de l'écran dashboard (Sprint 0, ROADMAP), éventuellement avec les mock-data.
- **Débloqué :** —

## Rôle 4 — Carte ID + QR + intégration ⏳ EN ATTENTE (partiel)
- **Débloqué côté backend (Sprint 1)** : tables `students`/`classes` exécutées dans Supabase — la génération de cartes peut commencer.
- **Peut faire dès maintenant :** maquette de la carte élève (Sprint 0, ROADMAP).
- **Débloqué :** —

---

## Événements de déblocage (historique court)
- *2026-11-13* — **Rôle 1 (audit)** : PR `fix/backend-audit-sessions-tests` — renouvellement automatique access/refresh token (middleware + endpoints), logout révoquant la session côté Supabase, 26 tests unitaires `node:test` (scan/dashboard/CSV/auth/time), `npm test` ajouté à la CI, ROADMAP : « Auth admin » cochée. Bloqué sur la création du compte admin (décision humaine).
- *2026-11-13* — **Rôle 1** : schéma corrigé appliqué et vérifié dans le projet Supabase `hdfefhltqyxiqnuruhlp` (anti-doublon par jour Conakry testé, RLS/policies admin vérifiées, `anon` bloqué). Backend Sprint 1–3 implémenté (auth admin, protection des routes, `/api/scan`, `/api/dashboard`, export CSV) — typecheck + build verts, endpoints d'auth vérifiés en runtime. Bloqué sur la création du compte admin (décision humaine).
- *2026-11-12* — Fichier créé. Aucun déblocage : Rôle 1 démarre le schéma du Sprint 0.
- *2026-11-12* — Fichier de schéma v1 commité (PR #4) + protection de `main` active (PR obligatoire, check CI, admins inclus).
- *2026-11-12* — **Autonomie des agents** : règle « 1 review » retirée de la protection de `main`. Chaque agent (Rôles 2/3/4) ouvre ses PR et les merge lui-même après CI verte (workflow dans `CONTRIBUTING.md`). Exception : schéma de données / sécurité / données élèves = validation Patrick obligatoire.
- *2026-11-12* — **PR #7 (transverse)** : workflow CI aligné sur Node 22 + vérification TypeScript et build ; procédure agents clarifiée ; suivi/handoff documenté. Aucune case ROADMAP cochée, car cette PR ne termine aucune tâche produit listée. CI vérifiée verte avant merge.
