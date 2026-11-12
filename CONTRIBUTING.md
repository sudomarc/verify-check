# CONTRIBUTING

Règles de contribution pour l'équipe VerifyCheck. Elles sont **obligatoires** : `main` est protégée sur GitHub.

## Agents IA — workflow obligatoire (PR → CI → merge)

Chaque agent de rôle (Rôles 2, 3, 4 de `TEAM.md`) travaille en autonomie et **merge lui-même ses PR**. Séquence stricte :

1. **Lire avant de coder** : `STATUS.md` (état/blocages), `ROADMAP.md` (tâches cochables), `TEAM.md` (son rôle), `CONTRIBUTING.md` (ce fichier). Re-vérifier l'état réel du repo — `STATUS.md` peut être en retard sur la réalité.
2. **Branche à partir de `main` à jour** : `git checkout main && git pull && git checkout -b feat/sprintX-<tache>`.
3. **Coder la tâche** : la plus haute priorité cochable de son rôle dans `ROADMAP.md` ; ne pas toucher aux tâches des autres rôles.
4. **Commit(s) clairs** : `feat(sprint-X): ...` / `fix: ...` / `docs: ...` — un commit par unité cohérente.
5. **Pousser la branche** puis **ouvrir la PR vers `main`** en remplissant le template (description + tâche ROADMAP + checklist).
6. **Attendre le check `CI / build`** : il est **requis** par la protection de branche — une PR rouge ne peut pas être mergée. Si la CI échoue : corriger sur la même branche, re-pousser.
7. **Merger soi-même** : `gh pr merge <num> --squash --delete-branch` (squash = un commit propre par PR dans `main`).
8. **Mettre à jour `STATUS.md`** dans la PR suivante (ou la même si docs) : tâche cochée dans `ROADMAP.md`, section de son rôle, handoff (fait / pas fait / bloqué).
9. **Handoff en fin de session** : si la tâche n'est pas terminée, écrire précisément ce qui reste à faire pour l'agent suivant du même rôle.

### Interdits pour les agents
- Push direct sur `main` (bloqué par GitHub), force-push, suppression de `main`.
- Modifier le schéma de données sans validation humaine (Patrick) — proposer en PR avec la mention « changement de schéma ».
- Commiter des secrets/clés ; ajouter une dépendance payante.
- Merger une PR dont le check `CI / build` n'est pas passé (impossible techniquement, ne pas chercher de contournement).

### Règle de revue humaine
Une PR qui touche le **schéma de données**, la **sécurité** (RLS, Auth, secrets) ou collecte des **données d'élèves** doit attendre une validation explicite de Patrick avant merge (mentionner `@sudomarc` dans la PR). Pour tout le reste, l'agent merge seul après CI verte.

---

## Règles humaines (rappel)

1. **Jamais de push direct sur `main`.** GitHub le refusera de toute façon (protection de branche activée).
2. **Toujours créer une branche à partir de `main`** à jour :
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/nom-de-la-tache   # ex: feature/sprint2-scanner-pwa
   ```
3. **Un commit clair par tâche** (voir `TEAM.md`) : `feat(sprint-2): ...`, `fix: ...`, `docs: ...`
4. **Ouvrir une Pull Request vers `main`** dès que la tâche est terminée, en remplissant le template de PR (description + tâche du `ROADMAP.md` concernée + checklist).
5. **Attendre que la CI passe** (workflow `CI` : typecheck + build). Une PR rouge ne se merge pas.
6. **Merger puis supprimer la branche** (squash recommandé).
7. Rappels : jamais de secrets/clés dans les commits ; toute évolution du schéma de données nécessite la validation de Patrick ; uniquement des services free tier.
