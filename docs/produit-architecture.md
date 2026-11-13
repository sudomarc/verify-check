# Architecture produit — VerifyCheck (refonte 2026-11)

## Utilisateurs et tâches

### Agent de pointage (PWA mobile `public/scanner/`)
1. Connexion (email + mot de passe admin de la salle) → session cookie httpOnly same-origin.
2. Contexte de pointage : classe **et** cours du moment (choisis parmi les cours
   actifs réels du jour, Conakry) + salle optionnelle.
3. Scan → `POST /api/scan {code_qr, salle}` → réponse serveur → état métier affiché.
4. Saisie manuelle du code si carte endommagée/caméra HS.
5. Réglages : son, vibration. (La démo hors-ligne forcée et la réinitialisation
   disparaissent de l'interface de production.)
6. File hors ligne : pointages stockés en IndexedDB avec un id unique,
   affichés **EN ATTENTE** jusqu'à confirmation serveur ; synchronisation au
   retour du réseau ; un doublon renvoyé par le serveur est confirmé (pas une
   erreur bloquante).

### Direction (dashboard web `/dashboard`)
1. Vue générale du jour : planning réel (cours prévus), effectif, présences.
2. Vues Classes / Cours / Élèves + filtres date, classe, cours, élève.
3. Distinction : **présent** (scan serveur), **non pointé** (cours pas encore
   terminé), **absent** (cours terminé sans scan). Jamais « absent » pour un
   cours futur ou en cours.
4. Export CSV des absences (uniquement cours terminés ou journée passée).
5. Cartes : génération/impression des cartes QR depuis les élèves réels.

### Élève (carte physique)
Identifiant scolaire, nom, classe, QR unique, identité visuelle école.
Aucune app élève. Le QR n'est pas une preuve d'identité : le serveur valide
code, cours actif, anti-doublon.

## Contrats API (inchangés sauf corrections listées)

- `POST /api/auth/login` / `POST /api/auth/logout` — session admin (cookies).
- `GET /api/dashboard?date&classe&cours&eleve` — données réelles du jour.
- `GET /api/dashboard/export?date&classe` — CSV absences (cours terminés ou
  journée passée uniquement).
- `POST /api/scan {code_qr, salle?}` — **correction** : plus de choix
  arbitraire. Si plusieurs cours actifs sans désambiguïsation → `cours_ambigu`
  (l'agent choisit la salle/le cours dans son contexte). Accepte désormais
  `{cours: id}` optionnel pour les portiques qui sélectionnent le cours.
- `GET /api/scan/context` — **nouveau** : classes, cours du jour avec heures et
  statut actif (source de l'écran de contexte). Auth admin requise.

Aucun changement de schéma SQL, de RLS ou de données élèves.

## Hors ligne (PWA)

- IndexedDB `vc-queue-v1` : file persistante de pointages non confirmés
  (id unique, code, cours, heure locale, tentatives).
- Un pointage sans serveur = **EN ATTENTE** (jamais « confirmé »).
- Synchronisation : au retour du réseau + à l'ouverture ; réponse `doublon`
  → confirmé en doublon ; `ok` → confirmé ; autre erreur → reste en file.
- Service worker existant conservé (cache des assets statiques).
