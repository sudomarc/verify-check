## Résumé

<!-- Décrire en français le problème, le contexte et l'objectif du changement. -->

## Modifications apportées

<!-- Lister précisément les changements réalisés, en français. -->

## Tâche ROADMAP.md concernée

<!-- Ex : Sprint 2 — connecter le scanner à l'API. Indiquer « Aucune » pour une modification transversale. -->

## Vérifications effectuées

<!-- Indiquer les commandes réellement exécutées, leurs résultats et les tests manuels réalisés. Ne jamais déclarer un test réussi sans preuve. -->

## Limites et points à suivre

<!-- Mentionner les éléments non testés, les risques et les décisions encore attendues. Écrire « Aucun » si applicable. -->

## Checklist

- [ ] Le titre et toute la description de cette PR sont en français.
- [ ] Les messages de commit sont en français avec les préfixes autorisés dans `CONTRIBUTING.md`.
- [ ] `npm run typecheck` passe (si applicable).
- [ ] `npm run build` passe (si applicable).
- [ ] La fonctionnalité a été testée manuellement dans le navigateur (si applicable).
- [ ] Aucune régression connue sur les parcours existants (scan, carte ID, tableau de bord).
- [ ] Aucune clé ni aucun secret n'a été commité (`.env` reste ignoré).
- [ ] Uniquement des services gratuits sont utilisés (aucune nouvelle dépendance payante).
- [ ] Si le schéma, RLS, Auth ou des données d'élèves sont concernés, l'approbation explicite de Patrick a été obtenue.
