# Web Verification Matrix

| Domaine | Preuve minimale | États possibles |
| Routes | chaque route voulue répond | VERIFIED / MISSING / UNKNOWN |
| Shell partagé | header/footer/nav/skip link | VERIFIED / UNVERIFIED |
| Clavier | tab, menu, Escape si pertinent, formulaires | VERIFIED / UNVERIFIED |
| Accessibilité | sémantique, focus, erreurs, contrastes | VERIFIED / PARTIAL / NOT RUN |
| Responsive | mobile, intermédiaire, desktop, wide | VERIFIED / PARTIAL |
| Données | chargement, validation, empty, error | VERIFIED / UNVERIFIED |
| Formulaires | validation, pending, succès, erreur, retry | VERIFIED / UNVERIFIED |
| Storage | cookies/storage/tracking | VERIFIED / UNKNOWN |
| Consent | gating et cycle de préférence si applicable | VERIFIED / N/A / UNVERIFIED |
| Légal | pages, placeholders, disclosures | VERIFIED / HUMAN ACTION |
| SEO | title, description, robots, canonical, sitemap, OG | VERIFIED / PARTIAL |
| Assets | taille, dimensions, provenance, licence | VERIFIED / PARTIAL |
| Motion | reduced-motion | VERIFIED / UNVERIFIED |
| 3D | fallback, visibilité, reduced-motion | VERIFIED / N/A / UNVERIFIED |
| Sécurité | headers, sinks, redirects, secrets, third parties | VERIFIED / PARTIAL |
| Performance | mesure représentative | MEASURED / NOT RUN |
| Hosting | publish/build/redirect/404/HTTPS | VERIFIED / PREPARED / UNKNOWN |
| Browser | routes/interactions/console/network | VERIFIED / LIMITED |
| Docs | README, roadmap, décisions, preuves | VERIFIED / PARTIAL |

## Fiche de preuve

Pour chaque contrôle, enregistrer :
- route/surface ;
- viewport ;
- navigateur/runtime ;
- état ;
- action ;
- attendu ;
- observé ;
- preuve ;
- date ;
- limitation.

## Distinctions obligatoires

- inspection source ≠ vérification runtime ;
- capture écran ≠ audit accessibilité complet ;
- intégration configurée ≠ ACTIVE/HEALTHY ;
- configuration de déploiement ≠ preuve de production ;
- test réussi ≠ preuve de tout le système.

## Cross-browser

Nommer explicitement les navigateurs indisponibles. Une vérification Edge-only ne devient pas une validation cross-browser.

## Production state

Utiliser :
- PREPARED pour la configuration ;
- ACTIVE pour l'état réel d'un fournisseur observé ;
- VERIFIED pour le comportement réellement exercé ;
- UNKNOWN lorsque la preuve production manque.
