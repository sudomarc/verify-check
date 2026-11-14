# VerifyCheck — App mobile (React Native + Expo)

Application mobile de pointage scolaire (direction / portique) pour VerifyCheck — Conakry, Guinée.
Client de l'**API backend existante** : aucune logique métier dupliquée, tous les pointages sont validés par le serveur (`POST /api/scan`).

## Fonctionnalités

- **Authentification admin** : email + mot de passe via Supabase Auth natif (session persistée, refresh automatique). Chaque appel API porte le JWT en `Authorization: Bearer` — le backend (`src/lib/auth.ts`) accepte ce header en plus des cookies web.
- **Contexte de pointage** : classes + cours du jour (heure de Conakry) fournis par `GET /api/scan/context`. L'agent choisit explicitement classe + cours (+ salle facultative) ; jamais de sélection arbitraire.
- **Scanner QR natif** : caméra (`expo-camera`) + **saisie manuelle** (carte abîmée / caméra refusée). Compteur « présents confirmés (serveur) » réel via `GET /api/dashboard`.
- **États honnêtes** : confirmé (201 serveur), doublon (confirmé par le serveur), carte non reconnue, pas de cours, cours ambigu (choix exigé), salle invalide, session expirée, erreur serveur. **Jamais d'état « confirmé » sans réponse du serveur.**
- **Hors ligne réel** : si le réseau ou le serveur est indisponible, le pointage est stocké en file locale persistante (AsyncStorage) avec état **EN ATTENTE**. Au retour du réseau (bouton « Synchroniser »), la file est rejouée : doublon serveur = confirmé ; rejet définitif = REJETÉ (visible, jamais perdu) ; réseau perdu = reste EN ATTENTE.
- **Historique** : derniers pointages de l'appareil + compteurs réels par cours du jour.

## Structure

```
mobile/
  app.json               config Expo (permissions caméra via plugin expo-camera)
  App.tsx                gate de session + 3 onglets (navigation simple volontaire)
  src/
    theme.ts             thème « registre scolaire contemporain » (docs/design-brief.md)
    lib/
      config.ts          lecture/validation des EXPO_PUBLIC_* (pur, testé)
      configStore.ts     cache de config
      scanStatus.ts      mapping réponse /api/scan → états affichables (pur, testé)
      queue.ts           file hors ligne — logique pure, stockage injecté (testé)
    services/
      auth.ts            Supabase Auth (supabase-js, AsyncStorage)
      api.ts             client API Bearer → /api/scan, /api/dashboard, /api/scan/context
    store/
      scan.ts            orchestration pointage + file (adaptateur AsyncStorage)
    screens/
      LoginScreen.tsx    AccueilScreen.tsx (contexte) · ScannerScreen.tsx · HistoriqueScreen.tsx
  tests/                 tests `node --test` (17 tests) — logique pure sans React Native
```

## Installation

```bash
cd mobile
npm install
npx expo install   # aligne les versions avec le SDK Expo installé
```

## Configuration (aucun secret dans le dépôt)

Copier le modèle et remplir les valeurs :

```bash
cp .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
```

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` : URL et clé **anon** publique du projet Supabase (jamais la clé `service_role` — les `EXPO_PUBLIC_*` sont publiques par nature, incluses dans le bundle client).
- `EXPO_PUBLIC_API_BASE_URL` : URL du site Next.js (prod Vercel) qui expose `/api/**`. En local : `http://<IP-PC>:3000` (pas `localhost` — l'appareil est sur le réseau).

Le rôle admin est vérifié côté serveur (RLS + `app_metadata`) ; l'app ne fait jamais de contrôle de rôle localement.

## Lancement (Expo Go)

```bash
npx expo start
```

Scanner le QR avec l'app **Expo Go** (Android/iOS) ou appuyer sur `a` (émulateur Android).
`expo-camera` est inclus dans Expo Go : pas de build natif requis pour tester.

## Vérifications effectuées

- ✅ `npx tsc --noEmit` (TypeScript strict)
- ✅ 17 tests `node --test mobile/tests/` (mapping états, file hors ligne, config)
- ✅ typecheck + tests backend racine (compat Bearer ajoutée à 5 routes API)

## Non vérifié (à faire sur matériel réel)

- ⬜ Build Android signé (EAS build ou APK) — nécessite un compte EAS ; l'environnement local n'a pas d'Android SDK.
- ⬜ Caméra + scan QR sur appareil physique réel.
- ⬜ Parcours complet login → scan → dashboard avec un compte admin Supabase réel (bloqué : création du compte admin en attente de la direction).

## Note navigation

La navigation est un simple état local à 3 onglets (`App.tsx`) : un seul flux admin, aucune pile modale. Une dépendance `react-navigation` n'apportait rien pour ce périmètre ; elle pourra être ajoutée quand un flux plus riche (plusieurs rôles, empilement d'écrans) sera nécessaire.
