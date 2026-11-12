# CONTRIBUTING

Règles de contribution pour l'équipe VerifyCheck. Elles sont **obligatoires** : `main` est protégée sur GitHub.

1. **Jamais de push direct sur `main`.** GitHub le refusera de toute façon (protection de branche activée).
2. **Toujours créer une branche à partir de `main`** à jour :
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/nom-de-la-tache   # ex: feature/sprint2-scanner-pwa
   ```
3. **Un commit clair par tâche** (voir `TEAM.md`) : `feat(sprint-2): ...`, `fix: ...`, `docs: ...`
4. **Ouvrir une Pull Request vers `main`** dès que la tâche est terminée, en remplissant le template de PR (description + tâche du `ROADMAP.md` concernée + checklist).
5. **Demander une review** : au moins **1 approbation** d'un autre membre de l'équipe est requise avant de merger (réglage GitHub, pas une simple politesse).
6. **Attendre que la CI passe** (workflow `CI` : lint + build). Une PR rouge ne se merge pas.
7. **Merger puis supprimer la branche** (bouton "Delete branch" de la PR, ou `git push origin --delete feature/nom-de-la-tache`).
8. Rappels : jamais de secrets/clés dans les commits ; toute évolution du schéma de données nécessite la validation de Patrick ; uniquement des services free tier.
