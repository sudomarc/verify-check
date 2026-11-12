# STATUS — État des tâches

> **Règle d'usage :**
> 1. Chaque agent/collaborateur, **à la fin de sa session**, met à jour **sa section** (via la PR de sa tâche — jamais de push direct sur `main`) et laisse un handoff clair : ce qui est fait, ce qui ne l'est pas, ce qui bloque.
> 2. Le Rôle 1 (Patrick) met à jour les sections des autres dès qu'une de ses tâches débloque la leur.
> 3. Ce fichier est un **instantané**, pas une source de vérité technique : en cas de doute, se fier au code sur `main` et à `ROADMAP.md`/`TEAM.md`.

**Dernière mise à jour :** 2026-11-12 — Patrick (Rôle 1)

---

## Rôle 1 — Backend/DB (Patrick) 🔨 EN COURS
- **En cours :** Sprint 0 — schéma de base de données (`classes`, `students`, `sessions`, `attendance` + contrainte anti-doublon élève/session, RLS)
- **Terminé :** —
- **Bloqué sur :** validation du schéma (décision d'architecture humaine)
- **Handoff :** aucun fichier de migration écrit pour l'instant ; la première version du schéma sera soumise à validation avant d'être commitée.

## Rôle 2 — Frontend scanner ⏳ EN ATTENTE DU RÔLE 1
- **Bloqué tant que :** tables + RLS + Supabase setup (Sprint 1, Rôle 1) ne sont pas en place, et l'endpoint scan (Sprint 2, Rôle 1) n'existe pas.
- **Peut faire dès maintenant :** maquette de l'écran scan (Sprint 0, ROADMAP) — rien ne dépend du schéma.
- **Débloqué :** —

## Rôle 3 — Frontend dashboard 🔨 SPRINT 0 LIVRÉ (à valider)
- **En cours :** —
- **Terminé :** Sprint 0 — maquette dashboard (`src/app/dashboard` + `src/components/dashboard`) : 3 vues (classe, cours, élève) sur données fictives, filtres date/export désactivés. **Non vérifié** : build non exécuté (Node absent sur le poste), pas encore validé par Patrick.
- **Bloqué sur :** Rôle 1 pour le Sprint 1 (auth) et le Sprint 3 (vues réelles + API).
- **Handoff :** branche `feat/sprint-0-dashboard-maquette` (basée sur `feat/mock-data`, mock non encore mergé). PR à ouvrir ; ne pas cocher la case ROADMAP avant validation + vérification navigateur.

## Rôle 4 — Carte ID + QR + intégration ⏳ EN ATTENTE DU RÔLE 1
- **Bloqué tant que :** tables `students`/`classes` (Sprint 1, Rôle 1) ne sont pas en place.
- **Peut faire dès maintenant :** maquette de la carte élève (Sprint 0, ROADMAP).
- **Débloqué :** —

---

## Événements de déblocage (historique court)
- *2026-11-12* — Fichier créé. Aucun déblocage : Rôle 1 démarre le schéma du Sprint 0.
