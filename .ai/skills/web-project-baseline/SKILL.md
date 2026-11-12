---
name: web-project-baseline
description: Baseline de complétude pour les projets web publics substantiels : structure, UI partagée, données, formulaires, stockage/cookies, légal, SEO, accessibilité, responsive, motion/3D, assets, sécurité, performance, déploiement et preuves.
---

# Web Project Baseline

Traiter un site web public comme un produit complet, pas comme une collection de pages.

Cette baseline généralise les pratiques observées dans Amplio Web v1. Elle ne doit pas copier son contenu, sa marque, ses coordonnées, son hébergeur ou ses choix ponctuels.

## Activation

Activer pour :
- nouveau site public ;
- site vitrine, marketing, portfolio, agence, présentation d'entreprise ou produit ;
- refonte substantielle ;
- préparation de mise en production.

Pour un petit outil interne, utiliser seulement les parties applicables.

Chaque capacité doit être classée :
- REQUIRED
- APPLICABLE
- NOT APPLICABLE
- DEFERRED
- UNKNOWN

Ne jamais ajouter une fonctionnalité uniquement pour satisfaire une checklist.

## Objectif

Au début du projet, établir une baseline couvrant :

1. architecture de l'information ;
2. structure du dépôt ;
3. shell partagé ;
4. design system ;
5. inventaire des routes et états ;
6. source de vérité des contenus ;
7. formulaires et soumissions ;
8. confidentialité, cookies et stockage navigateur ;
9. pages légales/compliance ;
10. SEO et découvrabilité ;
11. accessibilité ;
12. responsive ;
13. motion, animations et fallback 3D ;
14. assets et ressources tierces ;
15. sécurité navigateur ;
16. performance ;
17. états loading, empty, error, success ;
18. hébergement et déploiement ;
19. vérification navigateur ;
20. documentation et preuves de release.

Utiliser :
- references/static-site-blueprint.md
- references/cookies-and-storage.md
- references/verification-matrix.md
- .ai/templates/web-project-baseline.md

## Bootstrap et scaffolding initial

Pour un nouveau site web public, ne pas attendre la fin du développement pour traiter ces surfaces.

Après inspection de la stack et des exigences, générer ou préparer immédiatement les équivalents fonctionnels applicables de :
- routes/pages publiques principales ;
- page privacy et page legal/terms lorsque pertinentes ;
- 404/not-found ;
- shell partagé header/footer/navigation mobile ;
- skip link et navigation active ;
- structure assets/styles/scripts ;
- data/content et leurs contrats ;
- favicon/app icons ;
- robots.txt ;
- sitemap seulement lorsque la base publique est vérifiée ;
- configuration d'hébergement ;
- README et ROADMAP ;
- documentation de décisions et de vérification ;
- smoke tooling pour les contrôles adaptés à la stack.

Les informations manquantes doivent devenir des placeholders explicitement marqués, jamais des faits inventés.

La génération est guidée par l'applicabilité : une page ou fonctionnalité non pertinente reste NOT APPLICABLE et n'est pas artificiellement ajoutée.

## Matrice de transfert Amplio → projets web

Transférer les patterns d'ingénierie d'Amplio, pas son contenu métier :

| Pattern Amplio | À générer quand |
| Header/footer partials | site multi-page ou shell partagé pertinent |
| Service data source + sélection → contact prefill | parcours de lead avec sélection d'offre/service |
| Portfolio data source + filtres + empty state | collections filtrables |
| Formulaire validation/pending/success/error/retry | tout formulaire public |
| Notice privacy/resource | ressources tierces ou information utilisateur pertinente |
| Cookie/consent manager | seulement si cookies/tracking non essentiels nécessitent un contrôle |
| Privacy/legal pages | selon collecte, activité, juridiction et produit |
| Robots/SEO/OG/favicon | pages publiques indexables |
| Reduced motion + IntersectionObserver | animations/reveals présents |
| 3D avec fallback + pause | WebGL/3D présent |
| Responsive smoke checks | site public responsive |
| Verification docs + roadmap | projet substantiel |
| Hosting config + production-state checks | déploiement public |

Cette matrice est une règle de réutilisation : elle ne transforme pas un site corporate en copie littérale d'Amplio.

## Structure du dépôt

Choisir l'équivalent fonctionnel pour la stack réelle.

Pour un site statique substantiel, prévoir généralement :
- pages/routes ;
- shell partagé ou composants partagés ;
- assets/styles ;
- assets/scripts ;
- images/médias ;
- fonts si réellement justifiées ;
- data/content ;
- public ;
- tests ou outils de vérification ;
- docs ;
- README ;
- ROADMAP ;
- AGENTS ou instructions équivalentes ;
- configuration d'hébergement ;
- configuration PR si le dépôt utilise les PR.

Ne pas imposer une arborescence statique à Next.js, React, Astro, Vue, Svelte ou autre framework.

## Shell partagé

Pour plusieurs pages/routes publiques, fournir une implémentation faisant autorité pour :
- header ;
- navigation primaire ;
- navigation mobile ;
- état de route active ;
- footer ;
- skip link ou mécanisme équivalent ;
- focus-visible global.

Vérifier :
- navigation clavier ;
- ouverture/fermeture mobile ;
- Escape lorsque pertinent ;
- restitution du focus ;
- attributs ARIA appropriés ;
- liens privacy/legal pertinents.

Éviter de dupliquer le shell sur chaque page lorsque la stack offre un mécanisme partagé.

## Inventaire des routes

Évaluer explicitement, selon le produit :
- accueil ;
- à propos ;
- services/produits ;
- portfolio/cas clients ou preuve équivalente ;
- contact/lead capture ;
- confidentialité ;
- mentions légales/conditions ;
- 404/not-found ;
- pages spécifiques au domaine.

Ne pas créer de pages artificielles. Documenter les pages absentes et pourquoi.

Chaque route publique doit avoir :
- un objectif clair ;
- une source de contenu ;
- une stratégie de titre/description ;
- une hiérarchie de titres sémantique ;
- des états utiles si elle est dynamique ;
- un comportement responsive ;
- une stratégie d'accessibilité ;
- une vérification.

## Contenus et données

Éviter la duplication de contenu métier entre HTML, JS, formulaires et configuration.

Choisir une source de vérité adaptée :
- configuration typée ;
- JSON/YAML ;
- Markdown/MDX ;
- CMS ;
- API/base de données.

Pour du contenu rendu dynamiquement :
- valider les champs ;
- rejeter les identifiants dupliqués ;
- gérer données invalides/manquantes ;
- gérer empty/error ;
- valider les identifiants venant d'URL ou d'input externe.

Pour les parcours multi-pages, utiliser des identifiants stables et validés.

## Formulaires

Traiter le formulaire comme un cycle :

IDLE → EDITING → VALIDATING → SUBMITTING → SUCCESS ou RECOVERABLE ERROR

Baseline :
- labels explicites ;
- types natifs corrects ;
- required ;
- validation immédiate côté client ;
- validation côté serveur quand un serveur reçoit les données ;
- erreurs par champ accessibles ;
- focus sur le premier champ invalide ;
- état pending ;
- prévention des doubles soumissions ;
- succès ;
- erreur récupérable ;
- retry ;
- préservation des données saisies lorsque raisonnable ;
- protection anti-spam/rate limiting adaptée.

Ne jamais placer des données sensibles de formulaire dans localStorage, IndexedDB ou query strings.

Pour un hébergeur statique, vérifier que le service de formulaires est réellement ACTIVE en production. Un attribut HTML seul ne prouve pas l'activation.

## Cookies, stockage et consentement

Toujours faire l'inventaire avant l'implémentation.

Inspecter :
- cookies ;
- localStorage ;
- sessionStorage ;
- IndexedDB ;
- caches/service workers ;
- analytics ;
- pixels ;
- session replay ;
- embeds ;
- fonts distantes ;
- JS/CSS distants ;
- tags marketing.

Classer chaque stockage : nécessaire technique, session/auth, sécurité, préférence, analytics, publicité/marketing ou inconnu.

Ne pas créer un cookie banner par défaut.

Si le projet ne dépose pas de cookies non nécessaires et n'emploie pas de tracking nécessitant un consentement, documenter cette absence. Une notice informative peut être utile mais n'est pas un mécanisme de consentement.

Si le projet utilise des technologies non essentielles soumises à consentement :
- définir les catégories ;
- bloquer les technologies concernées avant le consentement lorsque requis ;
- persister le choix ;
- permettre la modification/révocation ;
- centraliser le gating pour éviter qu'une page le contourne ;
- réévaluer le choix lorsque la politique ou les fournisseurs changent.

Ne jamais présenter un choix UX comme juridiquement suffisant sans analyse d'applicabilité.

## Pages légales et compliance

Évaluer au minimum :
- privacy ;
- legal/terms quand applicable ;
- identité du responsable du traitement ou placeholders ;
- prestataires/third parties ;
- conservation ;
- crédits/licences des assets ;
- politique uploads/UGC si uploads ;
- unsubscribe/marketing si emails commerciaux ;
- abonnement/renouvellement si paiement.

Si l'information manque :
- utiliser un placeholder explicite ;
- marquer l'élément incomplet ;
- ne pas inventer une adresse, identité juridique, durée de conservation, immatriculation ou exemption.

Charger .ai/skills/legal-compliance/ lorsque le sujet est applicable.

## SEO

Pour les routes indexables :
- title unique ;
- meta description ;
- canonical quand l'URL de production est vérifiée ;
- robots ;
- sitemap lorsque pertinent et que la base publique est vérifiée ;
- favicon/app icons ;
- Open Graph ;
- locale quand pertinente ;
- headings ;
- liens internes ;
- structured data seulement si le contenu correspond réellement.

Ne jamais inventer une URL publique, un canonical, un sitemap ou une image OG.

## Accessibilité

Minimum :
- sémantique native ;
- un titre de page logique ;
- landmarks ;
- skip link ;
- focus visible ;
- clavier ;
- noms/descriptions accessibles ;
- erreurs/status de formulaires accessibles ;
- alt text utile ;
- alternatives aux interactions pointer-only ;
- contraste et tailles de cible appropriés ;
- reduced motion.

Un audit automatisé ne constitue pas une preuve complète d'accessibilité.

## Responsive

Vérifier au moins :
- mobile étroit ;
- largeur intermédiaire/tablette ;
- desktop ;
- wide desktop si pertinent ;
- une largeur de transition lorsque le layout change ;
- textes longs ;
- états vides/erreur ;
- touch et clavier lorsque leurs comportements diffèrent.

Vérifier overflow horizontal, clipping, overlays fixes, menu, formulaires, tableaux, médias et typographie.

## Motion et 3D

Motion est optionnel.

Pour les animations :
- définir leur rôle ;
- gérer prefers-reduced-motion ;
- ne pas masquer l'information essentielle ;
- pauser les traitements coûteux hors viewport lorsque possible.

Pour WebGL/3D :
- prévoir un fallback HTML/CSS ;
- ne jamais rendre l'information essentielle dépendante de WebGL ;
- limiter le device pixel ratio lorsque pertinent ;
- pauser les render loops invisibles ;
- gérer l'absence de WebGL ;
- charger les bibliothèques lourdes de façon différée lorsque pertinent ;
- vérifier reduced-motion et fallback.

## Assets et ressources tierces

Pour chaque asset important connaître :
- provenance ;
- licence/permission ;
- dimensions intrinsèques ;
- usage ;
- coût en octets/décodage ;
- fallback.

Auditer les ressources tierces avec :
purpose → provider → request/data → trust boundary → failure → fallback

Privilégier les ressources contrôlées localement quand cela améliore réellement confidentialité, fiabilité ou performance.

## Sécurité

Vérifier selon la stack :
- HTTPS ;
- security headers adaptés ;
- CSP lorsque possible ;
- protection clickjacking ;
- protection MIME sniffing ;
- Referrer-Policy ;
- flags Secure/HttpOnly/SameSite pour cookies d'auth ;
- CSRF pour les états authentifiés par cookie ;
- DOM sinks dangereux ;
- URL/redirects ;
- absence de secrets client ;
- third-party script trust ;
- validation uploads ;
- dépendances et versions.

Ne pas copier aveuglément les headers d'un autre projet.

## Performance

Mesurer avant d'optimiser.

Contrôler :
- ressources bloquantes ;
- transfert/exécution JS ;
- images et dimensions ;
- lazy loading ;
- fonts ;
- coût third-party ;
- waterfalls ;
- cache ;
- long tasks ;
- animation/3D ;
- loops invisibles ;
- hydratation/client work inutile.

## États et résilience

Toute fonctionnalité dynamique doit avoir une stratégie de :
- loading ;
- empty ;
- error ;
- success ;
- fallback.

Inclure lorsque pertinent :
- chargement de données échoué ;
- données invalides ;
- zéro résultat ;
- formulaire échoué ;
- ressource tierce indisponible ;
- WebGL indisponible ;
- reduced-motion ;
- 404 ;
- interruption réseau.

Un état d'erreur doit expliquer le problème et proposer l'action utile suivante.

## Déploiement

Avant production :
- vérifier build/publish ;
- vérifier URL publique avec preuve réelle ;
- vérifier redirects ;
- vérifier 404 ;
- vérifier HTTPS ;
- vérifier intégrations ACTIVE ;
- vérifier variables/secrets ;
- vérifier headers ;
- vérifier robots/sitemap ;
- documenter les éléments UNVERIFIED.

La configuration de déploiement n'est pas une preuve de déploiement.

## Vérification

Utiliser references/verification-matrix.md.

Enregistrer :
- route ;
- viewport ;
- navigateur ;
- état ;
- interaction ;
- résultat attendu ;
- résultat observé ;
- preuve ;
- date/environnement ;
- limitations.

Une capture d'écran prouve seulement l'état capturé.

## Completion gate

Un projet web public substantiel n'est pas déclaré complet tant que chaque catégorie n'est pas :
- VERIFIED ;
- NOT APPLICABLE avec preuve ;
- DEFERRED avec propriétaire/action ;
- UNKNOWN avec raison explicite.

Le rapport final sépare :
- implemented ;
- verified ;
- unverified ;
- unknown ;
- conflict ;
- human/legal/hosting actions.

## Leçons réutilisables d'Amplio

Amplio démontre la valeur de :
- pages publiques et pages légales dédiées ;
- shell header/footer partagé ;
- contenu JSON centralisé ;
- rendu dynamique validé ;
- continuité services → contact ;
- cycle de formulaire accessible ;
- prévention de double soumission ;
- skip link et navigation active ;
- responsive vérifié ;
- scripts différés ;
- reduced-motion ;
- 3D optionnelle avec fallback et pause hors viewport ;
- notice de ressources/confidentialité ;
- configuration d'hébergement ;
- documentation des éléments UNVERIFIED ;
- roadmap et preuves de release.

Ne pas copier ses incohérences connues ; les preuves runtime priment sur les affirmations documentaires.
