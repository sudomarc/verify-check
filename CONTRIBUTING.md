# CONTRIBUTING

Règles de contribution pour l'équipe VerifyCheck. Elles sont **obligatoires** : `main` est protégée sur GitHub.

## Agents IA — workflow obligatoire (PR → CI → merge)

Chaque agent de rôle (Rôles 2, 3, 4 de `TEAM.md`) travaille en autonomie et **merge lui-même ses PR**. Séquence stricte :

1. **Lire avant de coder** : `STATUS.md` (état/blocages), `ROADMAP.md` (tâches cochables), `TEAM.md` (son rôle), `CONTRIBUTING.md` (ce fichier). Re-vérifier l'état réel du repo — `STATUS.md` peut être en retard sur la réalité.
2. **Branche à partir de `main` à jour** : `git checkout main && git pull && git checkout -b feat/sprintX-<tache>`.
3. **Coder la tâche** : la plus haute priorité cochable de son rôle dans `ROADMAP.md` ; ne pas toucher aux tâches des autres rôles.
4. **Messages de commit en français :** rédiger le type, le périmètre et le résumé en français. Préfixes autorisés : `fonctionnalite(sprint-X): ...`, `correction: ...`, `documentation: ...`, `tests: ...`, `refactorisation: ...`, `maintenance: ...`. Exemple : `fonctionnalite(sprint-2): ajouter le retour de confirmation du scan`. Un commit par unité cohérente.

5. **Pousser la branche** puis **ouvrir la PR vers `main`** en remplissant le template. Le titre et toute la description de la PR doivent être rédigés en français : contexte, objectif, changements, tâche ROADMAP, vérifications, résultats et limites. Ne pas laisser de résumé automatique en anglais.

6. **Attendre le check `CI / build`** : il est **requis** par la protection de branche — une PR rouge ne peut pas être mergée. Si la CI échoue : corriger sur la même branche, re-pousser.
7. **Mettre à jour `STATUS.md` et `ROADMAP.md` dans la même PR, avant le merge** : actualiser la section du rôle et le handoff ; cocher uniquement les tâches ROADMAP réellement terminées. Pour une PR transverse qui ne termine aucune tâche listée, ne cocher aucune case et préciser ce périmètre dans `STATUS.md`.
8. **Merger soi-même** : `gh pr merge <num> --squash --delete-branch` (squash = un commit propre par PR dans `main`).
9. **Handoff en fin de session** : si la tâche n'est pas terminée, écrire précisément ce qui reste à faire pour l'agent suivant du même rôle.

### Interdits pour les agents
- Push direct sur `main` (bloqué par GitHub), force-push, suppression de `main`.
- Modifier le schéma de données sans validation humaine (Patrick) — proposer en PR avec la mention « changement de schéma ».
- Commiter des secrets/clés ; ajouter une dépendance payante.
- Merger une PR dont le check `CI / build` n'est pas passé (impossible techniquement, ne pas chercher de contournement).

### Règle de revue humaine
Une PR qui touche le **schéma de données**, la **sécurité** (RLS, Auth, secrets) ou collecte des **données d'élèves** doit attendre une validation explicite de Patrick avant merge (mentionner `@sudomarc` dans la PR). Pour tout le reste, l'agent merge seul après CI verte.

---

## Langue des contributions — règle obligatoire

La langue de travail du dépôt est le **français**. Cette règle s'applique à tous les agents IA, contributeurs humains et outils de génération :

- **Commits :** sujet et corps en français. Utiliser les préfixes français définis ci-dessus ; ne pas employer `feat`, `fix`, `docs` ou d'autres préfixes anglais.
- **Pull Requests :** titre, description, résumé automatique ajouté par un agent et commentaires rédigés par le contributeur en français.
- **Contenu :** expliquer en français le problème, la solution, les tests exécutés et ce qui reste non vérifié.
- **Exceptions limitées :** conserver tels quels les identifiants techniques, noms propres, noms de commandes, API, bibliothèques, fichiers, variables, messages d'erreur cités et termes anglais indispensables à la précision technique. Ces exceptions ne justifient pas de rédiger une phrase entière en anglais.

Exemples de titres de commit :

- `fonctionnalite(sprint-2): connecter le scanner à l'API`
- `correction: filtrer les cours selon le jour de la semaine`
- `documentation: préciser les règles de contribution`
- `tests: couvrir les scans en doublon`

Exemples de titres de PR :

- `Ajouter le retour de confirmation du scanner`
- `Corriger le filtrage des cours du tableau de bord`
- `Documenter les règles de sécurité Supabase`

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
