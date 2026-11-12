# ROADMAP — VerifyCheck

MVP d'application de suivi de présence scolaire par QR code (Conakry, Guinée).
Contrainte : budget 0 $ (free tiers uniquement). Voir `TEAM.md` pour la répartition des tâches.

## Stack technique

| Couche | Choix |
|---|---|
| Frontend web (dashboard + carte ID) | Next.js (App Router) + Tailwind CSS |
| Scanner QR (côté salle) | PWA + caméra navigateur (`html5-qrcode`) |
| Backend / Auth / DB temps réel | Supabase (Postgres + Auth + Realtime) |
| Génération QR | lib `qrcode` (JS) |
| Hébergement | Vercel (frontend) + Supabase Cloud (backend) |

---

## Sprint 0 — Setup
**Objectif : poser le socle avant toute fonctionnalité.**

- [ ] Schéma de base de données (modèle + SQL initial dans `supabase/schema.sql`) :
  - `classes` (id, nom)
  - `students` (id, code_qr unique, nom, classe_id)
  - `courses` (id, nom, classe_id, salle, jour_semaine, heure_debut, heure_fin)
  - `attendance` (student_id, course_id, scanned_at, anti-doublon élève/cours/jour)
- [ ] Maquettes rapides des 3 écrans clés :
  - [ ] Écran scan (portique/PWA, feedback de confirmation)
  - [ ] Écran carte élève (carte ID avec QR)
  - [ ] Écran dashboard direction (présence par classe/cours/élève)
- [ ] Initialisation du projet Next.js + Tailwind sur le repo
- [ ] Décisions d'architecture validées par Patrick (schéma + données collectées minimales)

## Sprint 1 — Fondations
**Objectif : tout ce qui doit exister avant qu'un scan ait un sens.**

- [ ] Setup Supabase (projet cloud, clés, variables d'environnement Vercel)
- [ ] Création des tables + RLS activé sur chaque table
- [ ] Auth admin (direction) : login, protection des routes admin
- [ ] Génération carte ID + QR unique par élève (page de génération + rendu imprimable)
- [ ] Données minimales de test (quelques élèves/classes factices)

## Sprint 2 — Flux de scan
**Objectif : le cœur du produit.**

- [ ] PWA scanner : caméra navigateur avec `html5-qrcode`
- [ ] Association scan → salle → cours actif (recherche du cours correspondant au moment du scan)
- [ ] Enregistrement de la présence horodatée dans `attendance`
- [ ] Feedback visuel/sonore de confirmation (présence validée / erreur)
- [ ] Tests manuels du parcours scan → présence dans le navigateur

## Sprint 3 — Dashboard direction
**Objectif : la valeur consultable par l'administration.**

- [ ] Vue présence par classe
- [ ] Vue présence par cours
- [ ] Vue présence par élève (historique)
- [ ] Filtres (date, classe, cours)
- [ ] Liste des absences + export (CSV ou liste imprimable)

## Sprint 4 — Polish + démo
**Objectif : robustesse et présentation.**

- [ ] Gestion des erreurs : double scan (anti-doublon), QR invalide, pas de cours en cours
- [ ] Données de démo réalistes (élèves, classes, cours, présences)
- [ ] Préparation de la présentation (scénario de démo, écran par écran)
- [ ] UI légère / rapide (contexte de connectivité faible à Conakry)
- [ ] Passage de revue final + PR vers `main`

---

## Règles de travail

- Branches `feat/*`, `fix/*` → PR vers `main` (main = stable).
- Cocher les cases de ce fichier au fur et à mesure (voir `TEAM.md`, section Suivi). Toute tâche déclarée terminée doit être cochée dans la même PR qui la termine.
- Une PR transverse qui ne termine aucune tâche listée ne doit cocher aucune case ; son périmètre et son résultat doivent être consignés dans `STATUS.md`.
- Toute évolution du schéma de données nécessite validation humaine (Patrick) — élèves mineurs, minimisation des données.
- Vérifier le coût : uniquement des services free tier.
