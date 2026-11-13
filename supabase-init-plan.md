# Plan Sprint 1 : Supabase cloud (free tier)

## Objectif
Créer le projet Supabase Cloud, exécuter `supabase/schema.sql`, et préparer les clés pour le frontend Vercel.

## Étapes à suivre manuellement (pour le moment)

1. **Créer le projet Supabase Cloud**
   - Rendez-vous sur https://supabase.com
   - Connectez-vous ou créez un compte (gratuit)
   - Cliquez sur "New project" → **Nom :** `verify-check` (ou toute autre identité)
   - **Région :** choisissez une région proche de Conakry si possible (ex: Africa (Accra) peut être accessible). Rester sur région free.
   - **Config SQL :** cochez "Use migration" (sera remplacé par le schema via l'étape suivante)
   - Créer le projet → il faudra quelques minutes pour provisionner.

2. **Obtenir les URLs et clés**
   - Dans le menu de gauche, cliquer sur **Settings** → **API**
   - **URL :** copier le `https://<project-id>.supabase.co`
   - **Clé publique (anon)** : copier `anon_public_key`
   - **Clé de service (secret)** : copier `service_role_key` (utiliser uniquement sur le backend/admin)

3. **Exécuter le schéma SQL**
   - Dans le même projet, aller vers le **SQL Editor**
   - Créer un nouveau script SQL : coller l'intégralité de `supabase/schema.sql` (dans le repo)
   - Exécuter : **Run** (ou sur des big objets c'est un script. Exécuter toute la chose)
   - S'assurer que l'exécution réussit sans erreur, et que le "Applied" est indiquant la version 1 (v1.1)

4. **Ajouter Vercel à Supabase**
   - Dans le même Supabase, cliquer sur **Settings** → **Website**
   - **Site URL :** `https://<your-vercel-project>.vercel.app` (sera ajouté plus tard)
   - **Redirect URIs :** `http://localhost:3000`, `http://localhost:3001`, `https://<your-vercel-project>.vercel.app`
   - **Add allowed URLs** pour les API pages.
   - **Ajouter les env vars** pour Vercel (voir ci-dessous). Cela peut être fait depuis l'interface Vercel à partir des **Project settings → Environment variables** dans le dashboard Vercel.

5. **Ajouter les variables d'environnement Vercel**
   - Dans le dashboard Vercel, sélectionner le projet `verify-check`
   - Ajouter les **variable globales** du Supabase project :
     - `NEXT_PUBLIC_SUPABASE_URL` → copy `https://<project-id>.supabase.co`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → copy `anon_public_key`
     - (Optionnel) `SUPABASE_SERVICE_ROLE_KEY` → copy `service_role_key` (uniquement si un backend utilise cela plus tard)
   - Pour le développement local, ajouter à `.env.local` (ou `.env.example` pour la documentation).

6. **Tester le tableau de bord des données**
   - Depuis l'**SQL editor** ou **Data tab** → `classes`, `students`, `courses`, `attendance`
   - Insérer une paire de test rapide de données fictives pour le dashboard (un élève, une classe, un cours). Utiliser l'**admin API** (Postman/Insomnia) avec le service_role_key.

7. **Vérifier le RLS**
   - Depuis la **Authentication tab** → **Users**, créer un utilisateur admin (vous-même : admin@verify-check.org).
   - Dans le **SQL editor**, tester `INSERT ...` sans JWT → échoue (401/403).
   - Si une connexion via Supabase Auth génère un token JWT (avec `authenticated`), tester `SELECT` sur les tables → fonctionne.
   - Cela garantit que le scanner (admin login) et le dashboard (même admin) sont autorisés.

8. **Mettre à jour `STATUS.md`**
   - Utiliser la PR dans la branche `docs/status-sprint0-done` comme modèle.
   - Cocher le Sprint 1 (création du projet Supabase, exécution du schéma, ajout Vercel).
   - Changer le Rôle 1 vers Sprint 2.

## Checklist rapide (cochez les cases manuellement)

- [ ] **Projet Supabase** créé (URL ouverte, keys visibles).
- [ ] **Schéma SQL** exécuté (aucune erreur, version v1.1 confirmée).
- [ ] **Auth admin** créé (à utiliser plus tard pour le scanner).
- [ ] **Vercel env vars** ajoutés (frontend peut communiquer).
- [ ] **Vérification du dashboard** (lire quelques données fictives).
- [ ] **RLS confirmé** (lecture/écriture réservée aux utilisateurs authentifiés).
- [ ] **STATUS.md** mis à jour (branch docs/status-sprint0-done).

## Résultat attendu
- **Backend**: tables Supabase (`classes`, `students`, `courses` (+ salle), `attendance`) et ses contraintes index/anti-doublon.
- **Frontend (Vercel)** : peut s'authentifier via `supabase.auth.signIn` (admin login) et lire depuis `supabase.from('classes').select() * et écrire `attendance`.

**Prochaine étape** (Sprint 2) : les agents scanner vont utiliser le client supabase (côté navigateur) pour scanner le QR et écrire l'horodatage (via le admin auth).

Si vous avez des certificats pour Supabase (ex: certificat auto-signé pour le CLI) indiquez-le ; sinon nous continuerons avec le workflow purement web/supabase-js.

> **Rappel de sécurité** : garder le `service_role_key` hors du versionnage du repo, mais stocker dans Vercel en tant que variable d'environnement. Ne jamais l'exposer à un client.

> **Coût** : plan gratuit de Supabase + Vercel (gratuit pour le temps de développement de ce MVP). Réaliser une vérification de la facturation après la première étape.

La partie backend est terminée une fois que vous avez le projet Supabase créé et son schéma exécuté, plus le Vercel env et un admin login testé.

Prêt à réaliser l'étape ?