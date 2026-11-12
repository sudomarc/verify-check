# STATUS — État des tâches

> **Règle d'usage :**
> 1. Chaque agent/collaborateur, **à la fin de sa session**, met à jour **sa section** (via la PR de sa tâche — jamais de push direct sur `main`) et laisse un handoff clair : ce qui est fait, ce qui ne l'est pas, ce qui bloque.
> 2. Le Rôle 1 (Patrick) met à jour les sections des autres dès qu'une de ses tâches débloque la leur.
> 3. Ce fichier est un **instantané**, pas une source de vérité technique : en cas de doute, se fier au code sur `main` et à `ROADMAP.md`/`TEAM.md`.

**Dernière mise à jour :** 2026-11-12 — Patrick (Rôle 1)

---

## Rôle 1 — Backend/DB (Patrick) 🔨 EN COURS
- **En cours :** Sprint 1 — setup Supabase Cloud (projet, clés, variables Vercel)
- **Terminé :** Sprint 0 — schéma v1.1 mergé (PR #4) : `classes`, `students`, `courses` (+`salle`), `attendance`, anti-doublon élève/cours/jour, RLS. ⚠️ SQL pas encore exécuté dans Supabase.
- **Bloqué sur :** création du projet Supabase (compte humain requis)
- **Handoff :** `supabase/schema.sql` v1.1 validé et mergé ; à exécuter dans le SQL Editor Supabase dès que le projet cloud existe.

## Rôle 2 — Frontend scanner ⏳ EN ATTENTE DU RÔLE 1
- **Bloqué tant que :** le projet Supabase est créé et les tables exécutées (Sprint 1, Rôle 1), puis l'endpoint scan (Sprint 2, Rôle 1).
- **Peut faire dès maintenant :** maquette de l'écran scan (Sprint 0, ROADMAP) — rien ne dépend du schéma.
- **Débloqué :** —

## Rôle 3 — Frontend dashboard ⏳ EN ATTENTE DU RÔLE 1
- **Bloqué tant que :** projet Supabase + tables + Auth admin (Sprint 1, Rôle 1). Données mock typées déjà disponibles (`src/lib/mock-data.ts`, PR #3).
- **Peut faire dès maintenant :** maquette de l'écran dashboard (Sprint 0, ROADMAP), éventuellement avec les mock-data.
- **Débloqué :** —

## Rôle 4 — Carte ID + QR + intégration ⏳ EN ATTENTE DU RÔLE 1
- **Bloqué tant que :** tables `students`/`classes` exécutées dans Supabase (Sprint 1, Rôle 1).
- **Peut faire dès maintenant :** maquette de la carte élève (Sprint 0, ROADMAP).
- **Débloqué :** —

---

## Événements de déblocage (historique court)
- *2026-11-12* — Fichier créé. Aucun déblocage : Rôle 1 démarre le schéma du Sprint 0.
- *2026-11-12* — Schéma v1.1 mergé (PR #4) + protection de `main` active (PR obligatoire, 1 review, check CI). Rôles 2–4 restent bloqués sur le setup Supabase (Rôle 1, Sprint 1).
