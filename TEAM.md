# TEAM — Répartition des tâches

4 rôles, chacun responsable des tâches de `ROADMAP.md` listées ci-dessous.
Ne pas coder une tâche avant que ses dépendances soient terminées (colonne « Dépend de »).

---

## Rôle 1 — Backend/DB
**Périmètre : schéma Supabase, API, logique métier (association scan/cours/élève).**

Ordre des tâches :

1. **Sprint 0** — Schéma de base de données (students, classes, sessions, attendance) *(aucune dépendance — à faire en premier, tout le monde en dépend)*
2. **Sprint 1** — Setup Supabase (projet cloud, clés, env Vercel)
3. **Sprint 1** — Création des tables + RLS
4. **Sprint 1** — Auth admin + protection des routes
5. **Sprint 2** — Endpoint/logique : scan → salle → session active → écriture `attendance` horodatée + anti-doublon
6. **Sprint 2** — Gestion des erreurs côté logique métier (double scan, QR invalide, pas de cours en cours)
7. **Sprint 3** — Requêtes/API du dashboard (par classe / cours / élève, filtres, export absences)

**Dépendances :** le Rôle 2 (scanner) et le Rôle 3 (dashboard) dépendent de ses tâches 1–3 (schéma + RLS + Supabase setup) avant de coder leurs écrans.

## Rôle 2 — Frontend scanner
**Périmètre : PWA caméra, UX du scan (feedback visuel/sonore).**

Ordre des tâches :

1. **Sprint 0** — Maquette rapide de l'écran scan
2. **Sprint 2** — PWA scanner : caméra navigateur avec `html5-qrcode`
3. **Sprint 2** — Feedback visuel/sonore de confirmation
4. **Sprint 4** — Polish des erreurs côté UI (double scan, QR invalide, pas de cours en cours)
5. **Sprint 4** — Tests manuels du parcours scan → présence (avec le Rôle 4)

**Dépend de :** Rôle 1 (schéma DB + logique métier du Sprint 2). Ne pas coder l'écriture de présence avant que l'endpoint scan du Rôle 1 existe.

## Rôle 3 — Frontend dashboard
**Périmètre : vue direction/admin, listes, filtres, export.**

Ordre des tâches :

1. **Sprint 0** — Maquette rapide de l'écran dashboard
2. **Sprint 1** — Pages d'auth admin (login, routes protégées) avec le Rôle 1
3. **Sprint 3** — Vue présence par classe / cours / élève
4. **Sprint 3** — Filtres (date, classe, cours)
5. **Sprint 3** — Liste des absences + export CSV
6. **Sprint 4** — UI légère/rapide (connectivité faible à Conakry)

**Dépend de :** Rôle 1 (tables + RLS + Auth du Sprint 1 ; API dashboard du Sprint 3).

## Rôle 4 — Carte ID + QR + intégration
**Périmètre : génération des cartes, données de démo, tests bout en bout, coordination présentation.**

Ordre des tâches :

1. **Sprint 0** — Maquette rapide de la carte élève
2. **Sprint 1** — Génération carte ID + QR unique par élève (lib `qrcode`, rendu imprimable)
3. **Sprint 1** — Données minimales de test (élèves/classes factices)
4. **Sprint 4** — Données de démo réalistes
5. **Sprint 4** — Préparation de la présentation (scénario de démo) + coordination finale

**Dépend de :** Rôle 1 (tables students/classes du Sprint 1 pour la génération des cartes ; données de démo du Sprint 4). Travaille avec le Rôle 2 pour les tests bout en bout.

---

## Suivi

### Mettre à jour sa progression
1. **Cocher les cases de `ROADMAP.md`** dès qu'une tâche est terminée et vérifiée (pas « presque terminée »).
2. **Un commit clair par tâche** : message au format `feat(sprint-2): scanner PWA avec html5-qrcode` ou `fix(...)` / `chore(...)`. La branche porte la tâche en cours (`feat/sprint-2-scanner-pwa`).
3. **PR vers `main`** pour chaque tâche ; la PR référence la tâche cochée du roadmap.
4. **En cas de blocage** : ne pas laisser une tâche bloquée en silence — signaler sur la PR/issue et, si la dépendance vient d'un autre rôle, le contacter directement.
5. **Avant chaque début de sprint** : le groupe passe en revue le roadmap, redistribue si besoin, et Patrick valide le périmètre.

### Règles communes
- Personne ne modifie le schéma de données sans validation de Patrick.
- Jamais de secrets/clés dans les commits (`.env` reste git-ignoré).
- Chaque PR doit être vérifiable : build qui passe, fonctionnalité testée manuellement dans le navigateur.
- Budget : uniquement des services free tier — toute nouvelle dépendance payante doit être proposée avant d'être ajoutée.
