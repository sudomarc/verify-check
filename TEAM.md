# TEAM — Répartition et suivi des tâches

Chaque tâche est une case à cocher. Une case ne passe à `[x]` que lorsque le travail est **terminé, intégré dans `main` et vérifié**. Une maquette ou des données fictives ne valent pas réalisation de la fonctionnalité réelle.

Les tâches sont détaillées dans `ROADMAP.md`. Respecter les dépendances avant de commencer l'implémentation.

---

## Rôle 0 — Coordination et supervision (assistant ChatGPT)

**Périmètre :** coordonner le travail des rôles, maintenir une vision fiable de l'état du dépôt, vérifier les preuves, suivre les dépendances, signaler les risques et préparer les arbitrages. Le Rôle 0 ne remplace aucun responsable d'implémentation et ne prend pas les décisions humaines à la place de Patrick.

- [x] Maintenir le suivi des tâches cohérent avec `main`, les PR fusionnées, la CI et les vérifications disponibles. *(STATUS/ROADMAP/TEAM synchronisés à chaque PR fusionnée — #16, #17, #20)*
- [x] Identifier les blocages, dépendances et risques, puis les transmettre au rôle ou à la personne responsable. *(blocage « compte admin Supabase » signalé à Patrick — seul point restant pour la vérification bout-en-bout)*
- [x] Préparer des plans et prompts précis pour les agents d'implémentation, sans leur attribuer de décisions non approuvées.
- [x] Vérifier les changements proposés : périmètre, preuves, sécurité, tests et cohérence documentaire. *(tests, typecheck, build, runtime 401, revue des diffs avant chaque PR)*
- [ ] Préparer la revue de fin de MVP et le scénario de démonstration ; la validation finale appartient à Patrick. *(restant — après création du compte admin et saisie de données réelles)*

## Rôle 1 — Backend / DB (Patrick)

**Périmètre :** Patrick est le responsable humain du backend/DB et le mainteneur du projet. Il pilote le schéma Supabase, l'API, la logique métier et la sécurité des données ; il valide les décisions d'architecture, de schéma, de RLS/Auth et de traitement des données élèves. L'assistant (Rôle 0) coordonne et vérifie, mais ne se substitue pas à son approbation.

1. **Sprint 0 — Schéma**
   - [x] Définir et faire valider le modèle de données `classes`, `students`, `courses`, `attendance`. *(validé par Patrick, appliqué dans Supabase)*
   - [x] Corriger et vérifier le SQL initial (`supabase/schema.sql`), notamment l'anti-doublon par jour. *(index unique testé en base : doublon rejeté 23505, lendemain accepté)*
2. **Sprint 1 — Infrastructure**
   - [x] Créer/configurer le projet Supabase (compte humain requis). *(projet `hdfefhltqyxiqnuruhlp`, CLI liée)*
   - [x] Configurer les variables d'environnement sans exposer de secrets. *(locales + `.env.example` commités ; variables **production Vercel** à confirmer par Patrick)*
   - [x] Créer les tables et vérifier les migrations dans Supabase.
   - [x] Configurer et tester des politiques RLS qui limitent réellement l'accès aux admins autorisés. *(policies `app_metadata.role='admin'`, `anon` bloqué — testé en base)*
   - [x] Implémenter l'authentification admin et la protection des routes. *(PR #16 : cycle access/refresh, révocation au logout ; `/api/**` → 401 sans session, `/dashboard` → 307 — vérifié en runtime)*
3. **Sprint 2 — Logique de présence**
   - [x] Implémenter l'association scan → salle → cours actif. *(PR #20 : désambiguïsation `cours_ambigu`/salle/cours explicite, plus jamais de choix arbitraire)*
   - [x] Enregistrer une présence avec horodatage serveur. *(`scanned_at` défaut `now()`, horodatage base)*
   - [x] Empêcher les doublons élève/cours/jour. *(index unique d'expression, jour local Conakry)*
   - [x] Gérer les erreurs métier : double scan, QR invalide, aucun cours actif. *(`doublon`, `qr_invalide`, `pas_de_cours`, `salle_invalide`, `cours_pas_actif`)*
4. **Sprint 3 — API dashboard**
   - [x] Fournir les données de présence par classe, cours et élève. *(`GET /api/dashboard`, branché sur le dashboard réel — PR #20)*
   - [x] Fournir les filtres et les données nécessaires à l'export des absences. *(`GET /api/dashboard/export` — export honnête : pas d'absence avant la fin du cours)*

**Dépendances :** les rôles 2 et 3 ne branchent pas leurs écrans sur le backend avant que le schéma, Supabase et les règles d'accès nécessaires soient prêts. Le rôle 2 attend aussi l'endpoint de scan avant d'implémenter l'écriture réelle des présences.

## Rôle 2 — Frontend scanner

**Périmètre :** PWA de scan, caméra et retour utilisateur.

- [x] **Sprint 0 :** réaliser la maquette de l'écran de scan — maquettes HTML + PWA scanner réel (PR #20 fusionnée).
- [x] **Sprint 2 :** intégrer la caméra navigateur avec `html5-qrcode` — PWA scan réel (PR #20).
- [x] **Sprint 2 :** connecter le scan à l'endpoint backend et afficher le résultat réel — états serveur honnêtes, jamais de « confirmé » sans réponse (PR #20).
- [ ] **Sprint 2 :** ajouter les retours visuel et sonore de confirmation/erreur (visuel fait ; sonore restant).
- [x] **Sprint 4 :** traiter les états d'erreur côté interface (double scan, QR invalide, aucun cours actif) — PR #20 + app mobile.
- [ ] **Sprint 4 :** tester manuellement le parcours complet scan → présence avec le rôle 4 (bloqué : compte admin Supabase à créer, décision de Patrick).

**Dépend de :** rôle 1 pour l'API de scan et les règles métier. La maquette peut être faite avant le backend.

### App mobile native (ajout au périmètre — React Native + Expo)

- [x] **Audit** : réutilisation des API backend existantes (`/api/scan`, `/api/scan/context`, `/api/dashboard`) ; extension backend `Authorization: Bearer` (helper `requestAccessToken`, 5 routes) — aucune logique métier dupliquée, aucun changement de schéma/RLS.
- [x] **Scaffold** : `mobile/` Expo SDK 58, TypeScript strict, `expo-doctor` 20/20.
- [x] **Auth** : Supabase Auth natif (email/mot de passe, session persistée AsyncStorage, refresh auto).
- [x] **Scanner** : caméra native (`expo-camera`) + saisie manuelle, compteur réel serveur, historique local.
- [x] **Hors ligne** : file persistante (EN ATTENTE / CONFIRMÉ / REJETÉ), doublon serveur = confirmé, rejet définitif visible, jamais perdu.
- [x] **Vérifié** : `tsc --noEmit` strict OK (mobile + racine), 17 tests `node --test mobile/tests/` verts, 32 tests racine verts.
- [ ] **Non vérifié** : build Android signé (EAS/SDK manquant sur la machine), caméra sur appareil physique, parcours complet avec compte admin réel (bloqué : décision de Patrick).

## Rôle 3 — Frontend dashboard

**Périmètre :** vues direction/admin, listes, filtres et export.

- [x] **Sprint 0 :** réaliser la maquette du dashboard direction avec les vues par classe, cours et élève — PR #6 fusionnée dans `main`.
- [ ] **Sprint 1 :** intégrer les pages de connexion admin et la protection des routes avec le rôle 1.
- [ ] **Sprint 3 :** connecter la vue présence par classe aux données réelles.
- [ ] **Sprint 3 :** connecter la vue présence par cours aux données réelles.
- [ ] **Sprint 3 :** connecter la vue présence par élève et son historique aux données réelles.
- [ ] **Sprint 3 :** implémenter les filtres date, classe et cours.
- [ ] **Sprint 3 :** implémenter la liste des absences et l'export CSV ou imprimable.
- [ ] **Sprint 4 :** optimiser l'interface pour une utilisation légère et une connectivité faible à Conakry.

**Dépend de :** rôle 1 pour les tables, RLS, Auth et API du dashboard. La maquette actuelle utilise des données fictives ; elle ne constitue pas une connexion au backend.

## Rôle 4 — Carte ID, QR et intégration

**Périmètre :** génération des cartes, données de test/démo et validation de bout en bout.

- [ ] **Sprint 0 :** réaliser la maquette de la carte élève.
- [ ] **Sprint 1 :** générer une carte ID avec un QR unique par élève et un rendu imprimable.
- [x] **Sprint 1 — préparation :** créer des données fictives typées pour les classes, élèves, cours et présences (`src/lib/mock-data.ts`, PR #3 fusionnée). Ces données sont des mocks, pas des enregistrements Supabase. *(Fichier supprimé depuis : les écrans utilisent les données réelles via `/api/dashboard`.)*
- [ ] **Sprint 4 :** préparer un jeu de données de démonstration réaliste et cohérent.
- [ ] **Sprint 4 :** préparer le scénario de présentation et coordonner la démonstration finale.
- [ ] **Sprint 4 :** participer aux tests de bout en bout avec le rôle 2.

**Dépend de :** rôle 1 pour les tables `students` et `classes` avant la génération liée aux données réelles. Le rôle 4 travaille avec le rôle 2 pour les tests de bout en bout.

---

## Règles de suivi

9. **Langue obligatoire — français :** tous les messages de commit, titres de Pull Request et descriptions de Pull Request doivent être rédigés intégralement en français. Les identifiants techniques imposés (noms de fichiers, commandes, API, noms de branches, mots-clés GitHub) peuvent rester inchangés. Les préfixes de commit doivent eux aussi être en français : `fonctionnalite:`, `correction:`, `documentation:`, `tests:`, `refactorisation:` ou `maintenance:`. Les titres de PR doivent décrire clairement le changement en français ; leur description doit expliquer le contexte, les modifications, les vérifications et les limites en français.

1. **Cocher dans la PR qui termine la tâche :** le responsable peut préparer la case `[x]` dans sa PR, mais elle ne compte comme terminée qu'après fusion dans `main`, CI requise verte et vérification adaptée. Une PR ouverte, une fonctionnalité partielle ou une simple déclaration ne suffit pas.
2. **Synchroniser la documentation dans la même PR :** mettre à jour `TEAM.md`, `STATUS.md` et `ROADMAP.md` lorsque la tâche correspondante y figure ; préciser les preuves et limites.
3. **Une tâche cohérente par commit/PR :** utiliser un message explicite, par exemple `feat(sprint-2): scanner PWA` ou `docs: update team task tracking`.
4. **Respect des dépendances :** ne pas commencer une intégration qui dépend d'un backend ou d'une validation non disponible.
5. **Blocage explicite :** décrire le blocage, son impact et la personne/le rôle attendu dans la PR ou l'issue.
6. **Pas de push direct sur `main` :** travailler sur une branche et ouvrir une PR.
7. **Validation humaine obligatoire :** Patrick (Rôle 1 / mainteneur humain) doit approuver les changements de schéma, RLS, Auth, secrets ou données personnelles d'élèves avant leur merge. Le Rôle 0 ne peut pas donner cette approbation à sa place.
8. **Budget :** services free tier uniquement ; toute dépendance ou service payant doit être soumis à validation avant adoption.

