# Scanner VerifyCheck (PWA)

Écran scan de VerifyCheck : l'élève présente sa carte QR, l'app valide la présence
au cours en cours. **Sprint 2 — Rôle 2** (voir `ROADMAP.md` / `TEAM.md`).

## Lancer

Le scanner est servi par l'application Next.js, sous `/scanner`
(voir la rewrite dans `next.config.mjs`). Une fois `main` déployé sur Vercel :

```text
https://<domaine-vercel>/scanner
```

En développement local, `npm run dev` puis `http://localhost:3000/scanner`.
Il peut aussi être servi seul (utile pour itérer sur l'UI) :

```bash
python -m http.server 8099 --directory public
# puis http://127.0.0.1:8099/scanner/
```

La caméra et le service worker exigent `https://` ou `localhost` — ouvrir
`index.html` en `file://` affiche l'app mais sans caméra ni mode hors-ligne.
Pour tester depuis un téléphone, servir en HTTPS (ou via un tunnel) :
`getUserMedia` est refusé en HTTP non-localhost.

Aucune étape de build : HTML/CSS/JS statiques, lib QR vendorisée
(`vendor/html5-qrcode.min.js`), donc utilisable avec une connectivité faible.

## Ce qui est implémenté

- Caméra arrière + décodage QR (`lib/qr.js`, encapsule `html5-qrcode`).
- Feedback **visuel** (bandeau + halo plein écran lisible à distance), **sonore**
  (WebAudio, aucun fichier) et **haptique** (`navigator.vibrate`).
- États gérés : `idle`, `success`, `duplicate` (double scan), `invalid` (QR inconnu),
  `no-course` (aucune session ouverte), `queued` (hors ligne), `error`
  (échec d'enregistrement côté service).
- **Erreurs explicitées côté UI** : messages caméra distincts (permission refusée,
  aucune caméra, caméra occupée, contexte non sécurisé), bouton « Réessayer »
  fonctionnel + repli « Saisie manuelle », erreur en ligne sous le champ manuel,
  bandeau en `role="alert"` pour les échecs, file hors-ligne conservée si la
  synchronisation échoue.
- **File hors-ligne** : les scans faits sans réseau sont stockés localement
  (`localStorage`) et rejoués au retour de la connexion.
- Repli **saisie manuelle** (carte abîmée / caméra refusée) + torche + bascule caméra.
- PWA installable : `manifest.webmanifest` + `service-worker.js`
  (stale-while-revalidate, coquille mise en cache).
- Réglages : son, vibration, cours simulé, effacement des données locales.

## ⚠️ Données : mock pour l'instant, cible = `/api/scan`

`lib/mock-data.js` reprend les données de `src/lib/mock-data.ts` (branche `main`).
`lib/api.js` est un **mock** du contrat attendu. La vraie cible est l'endpoint
déjà présent sur `main`, `src/app/api/scan/route.ts` :

- `POST /api/scan`, corps `{ code_qr, salle? }` ;
- réponses : `201 {ok, eleve, cours, presence, jour_local}`,
  `404 qr_invalide|pas_de_cours`, `409 doublon|salle_invalide`, `400 code_qr_requis` ;
- **exige une session admin** (`requireAdmin` + cookie de session) : le schéma
  révoque tous les droits à `anon`, le scanner ne peut donc pas taper Supabase
  directement. Comme il est servi same-origin sous `/scanner`, le cookie admin
  est envoyé automatiquement.

Les points à remplacer dans `lib/api.js` sont marqués `TODO API` :

| Fonction | Attendu côté serveur |
|---|---|
| `getActiveCourse()` | session active au moment du scan (classe, matière, salle, horaire) |
| `findStudentByCode(code)` | résolution du QR → élève (déjà couvert par `POST /api/scan`) |
| `recordAttendance(...)` | `POST /api/scan` + **anti-doublon élève/cours** (index unique en base) |

Le reste de l'UI (états, feedback, file hors-ligne) ne bouge pas quand l'API arrive.

## Vérification

Testé dans Chromium (localhost) : les 6 états se rendent, 0 erreur console,
compteur/derniers scans cohérents, file hors-ligne vidée à la reconnexion,
service worker `activated`.
**Non vérifié ici** : le décodage réel d'un QR, faute de caméra/permission dans
l'environnement de test. À valider sur un appareil réel (Rôle 4, Sprint 2/4).

Les chemins d'erreur se testent sans backend : cocher « Simuler une panne
d'enregistrement » dans les réglages (ou `VC.debug.setFailure(true)`) fait
échouer l'écriture → état `error` + toast ; refuser la caméra déclenche le
message « Caméra refusée » et le repli manuel.
