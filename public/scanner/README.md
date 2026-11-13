# VerifyCheck — Scanner PWA

Application mobile-first de pointage (agents de salle), servie depuis `/scanner/`.

## Données réelles

- Connexion : `POST /api/auth/login` (cookies httpOnly same-origin).
- Contexte : `GET /api/scan/context` (classes + cours du jour Conakry, statut actif).
- Pointage : `POST /api/scan` (validation serveur : élève, cours actif, salle,
  anti-doublon).
- Compteur : `GET /api/dashboard` (effectif et présents confirmés du cours).

Aucune donnée simulée. La file hors ligne est persistée en **IndexedDB**
(`vc-scanner`) ; un pointage hors ligne reste **EN ATTENTE** jusqu'à
confirmation du serveur. Un doublon renvoyé par le serveur à la synchronisation
est confirmé, pas une erreur.

## Contexte de pointage

Plusieurs cours peuvent être actifs en même temps. Le serveur **refuse le
pointage ambigu** (`cours_ambigu`) : l'agent choisit le cours (écran de
contexte) et peut préciser la salle du portique.

## Développement

```bash
npm run dev            # serveur Next.js (API + dashboard)
# scanner : http://localhost:3000/scanner/   (ou derrière le build)
```

L'écran de connexion exige un compte admin Supabase Auth
(`app_metadata.role = "admin"`).
