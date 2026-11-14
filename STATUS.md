# STATUS — État des tâches

> **Règle d'usage :**
> 1. Chaque agent/collaborateur, **à la fin de sa session**, met à jour **sa section** (via la PR de sa tâche — jamais de push direct sur `main`) et laisse un handoff clair : ce qui est fait, ce qui ne l'est pas, ce qui bloque.
> 2. Le Rôle 1 (Patrick) met à jour les sections des autres dès qu'une de ses tâches débloque la leur.
> 3. Ce fichier est un **instantané**, pas une source de vérité technique : en cas de doute, se fier au code sur `main` et à `ROADMAP.md`/`TEAM.md`.

**Dernière mise à jour :** 2026-11-14 — Maintenance technique (cycle 1) : corrections scanner PWA (service worker), sécurité (open redirect), nettoyage du code mort, hygiène Git. Détails ci-dessous et dans `ROADMAP.md`.

## Maintenance technique — cycle 1 (2026-11-14)

- **Corrigé (scanner PWA)** : le service worker listait `./lib/mock-data.js` (fichier supprimé) → `cache.addAll` échouait et le shell n'était **jamais** mis en cache (mode hors ligne cassé). Liste corrigée + version de cache incrémentée (`v4`).
- **Corrigé (sécurité/état)** : le service worker servait les réponses `/api/**` depuis le cache (stale-while-revalidate) — un contexte ou une session obsolète pouvait être réutilisé après déconnexion. Les appels `/api/**` ne sont plus mis en cache ; navigations en réseau-d'abord.
- **Corrigé (fiabilité métier)** : `POST /api/scan` renvoyait `qr_invalide` (rejet définitif côté scanner) même en cas de panne base. Désormais une erreur autre que « 0 ligne » renvoie `erreur_base` (500) → le pointage reste en file au lieu d'être perdu.
- **Corrigé (fiabilité métier)** : la file hors ligne ne rejette plus définitivement `cours_pas_actif` / `pas_de_cours` / `salle_invalide` à la synchronisation (ces cas surviennent normalement quand la synchro arrive après la fin du cours) : le pointage reste **EN ATTENTE**, jamais supprimé silencieusement. Seul `qr_invalide` reste un rejet définitif.
- **Corrigé (sécurité)** : open redirect via le paramètre `next` de `/login` (`//evil.com`) → helper `safeNext` (chemin interne uniquement) + tests.
- **Corrigé (PWA)** : l'URL propre `/scanner` (sans slash) cassait les chemins relatifs (`styles.css`, `lib/*`, service worker) ; redirection vers `/scanner/index.html`.
- **Corrigé (encodage)** : `public/scanner/styles.css` contenait des octets UTF-8 invalides (`Écrans`, `réelle` en latin-1) → fichier ré-encodé UTF-8.
- **Nettoyé** : suppression du code mort (`src/lib/mock-data.ts`, `src/lib/supabase.ts`, `pg_connect_tmp.mjs`, CSS `.ini`/`.codes`), protection `/scan` morte retirée du middleware, `.gitignore` complété (`supabase/.temp/`), page d'accueil placeholder remplacée.
- **Vérifié** : `npm run typecheck` OK, `npm test` **37 tests** verts, `npm run build` OK, redirections scanner et 401 API re-testés en runtime.

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

## Variables d'environnement (pour tous les rôles)

Les variables **publiques** du projet Supabase (URL + clé `anon`) sont commitées en vraies valeurs dans **`.env.example`** : copiez-le en `.env.local` pour développer (`cp .env.example .env.local`) ou reprenez les valeurs directement. La clé `anon` est publique par conception (RLS côté base) — côté serveur/node, copier le fichier en `.env.local` suffit pour Next.js.
Aucun token privé GitHub, Supabase ou Vercel ne doit figurer dans `.env.example`, dans la documentation ou dans Git. Les accès d'administration doivent être fournis uniquement par l'environnement local ou les mécanismes d'authentification propres à chaque outil.

## Refonte produit (en cours — branche `feat/refonte-produit`)

- **FAIT (code)** : corrections métier backend — `POST /api/scan` refuse désormais un contexte ambigu (`cours_ambigu`, plus jamais de choix arbitraire du 1er cours) et accepte `cours` explicite ; export CSV honnête (un cours non terminé n'est pas « absent ») ; nouvel endpoint `GET /api/scan/context` (contexte de pointage réel).
- **FAIT (code)** : PWA scanner reconnectée aux API réelles (login same-origin, contexte, `POST /api/scan`), file hors ligne **IndexedDB** persistante avec états EN ATTENTE / confirmé / doublon confirmé / rejeté ; écrans connexion + contexte de pointage ; démo (`mock-data.js`, forçage hors-ligne) retirée de la production ; saisie manuelle conservée.
- **FAIT (code)** : dashboard reconnecté aux données réelles (`GET /api/dashboard`) — vues Générale / Classes / Cours / Élèves / Cartes QR, filtres date+classe+cours, distinction PRÉSENT / NON POINTÉ / ABSENT à l'heure Conakry, export CSV, génération & impression des cartes QR depuis les élèves réels.
- **FAIT** : design brief `docs/design-brief.md` (3 directions comparées, « Registre scolaire contemporain » retenu) + architecture produit `docs/produit-architecture.md`.
- **À VÉRIFIER** : parcours réel login→scan→dashboard bloqué sur la création du **compte admin Supabase** (décision humaine) ; tests caméra/PWA sur téléphone réel ; QA navigateur complet.


---

## Événements de déblocage (historique court)
- *2026-11-13* — **Rôle 1 (audit)** : PR `fix/backend-audit-sessions-tests` — renouvellement automatique access/refresh token (middleware + endpoints), logout révoquant la session côté Supabase, 26 tests unitaires `node:test` (scan/dashboard/CSV/auth/time), `npm test` ajouté à la CI, ROADMAP : « Auth admin » cochée. Bloqué sur la création du compte admin (décision humaine).
- *2026-11-13* — **Rôle 1** : schéma corrigé appliqué et vérifié dans le projet Supabase `hdfefhltqyxiqnuruhlp` (anti-doublon par jour Conakry testé, RLS/policies admin vérifiées, `anon` bloqué). Backend Sprint 1–3 implémenté (auth admin, protection des routes, `/api/scan`, `/api/dashboard`, export CSV) — typecheck + build verts, endpoints d'auth vérifiés en runtime. Bloqué sur la création du compte admin (décision humaine).
- *2026-11-12* — Fichier créé. Aucun déblocage : Rôle 1 démarre le schéma du Sprint 0.
- *2026-11-12* — Fichier de schéma v1 commité (PR #4) + protection de `main` active (PR obligatoire, check CI, admins inclus).
- *2026-11-12* — **Autonomie des agents** : règle « 1 review » retirée de la protection de `main`. Chaque agent (Rôles 2/3/4) ouvre ses PR et les merge lui-même après CI verte (workflow dans `CONTRIBUTING.md`). Exception : schéma de données / sécurité / données élèves = validation Patrick obligatoire.
- *2026-11-12* — **PR #7 (transverse)** : workflow CI aligné sur Node 22 + vérification TypeScript et build ; procédure agents clarifiée ; suivi/handoff documenté. Aucune case ROADMAP cochée, car cette PR ne termine aucune tâche produit listée. CI vérifiée verte avant merge.
