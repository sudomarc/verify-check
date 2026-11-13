# Développement local Windows

## Prérequis

- Windows 10/11 64 bits.
- Git for Windows.
- Node.js 22 LTS (npm est inclus).
- Un projet Supabase accessible pour exécuter les fonctionnalités connectées.

Vérifier les outils dans PowerShell :

```powershell
git --version
node --version
npm --version
```

Node doit afficher une version majeure `v22`. Le dépôt utilise npm et son `package-lock.json` : conserver `npm ci` plutôt que `npm install` pour reproduire les dépendances verrouillées.

## Installation initiale

```powershell
git clone https://github.com/sudomarc/verify-check.git
cd verify-check
npm ci
Copy-Item .env.local.example .env.local
notepad .env.local
```

Dans `.env.local`, renseigner les deux variables depuis **Supabase Dashboard → Project Settings → API** :

- `NEXT_PUBLIC_SUPABASE_URL` : URL du projet.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : clé publishable (ou anon legacy).

Ne jamais mettre une clé `service_role`, un secret Supabase, un token GitHub ou un token Vercel dans une variable `NEXT_PUBLIC_*`. Ne jamais commiter `.env.local`.

## Démarrer

```powershell
npm run dev
```

Ouvrir http://localhost:3000. Pour tester le scanner avec une caméra, utiliser localhost ou un contexte HTTPS et autoriser l'accès caméra dans le navigateur.

## Vérifications avant commit

```powershell
npm run typecheck
npm test
npm run build
```

Lancer les commandes séparément : corriger toute erreur avant de continuer. Le build CI utilise des valeurs Supabase factices ; un build réussi ne prouve donc pas que le projet Supabase, les migrations, les comptes ou les policies fonctionnent.

## Mise à jour

```powershell
git switch main
git pull --ff-only
npm ci
```

Si tu travailles sur une branche, ne bascule pas vers `main` avant d'avoir commité ou sauvegardé tes changements.

## Dépannage

- **Node trop ancien** : installer Node.js 22 LTS, fermer puis rouvrir PowerShell.
- **Dépendances incohérentes** : supprimer `node_modules`, puis relancer `npm ci`. Ne supprimer ni modifier `package-lock.json` sans raison.
- **Variables Supabase absentes** : vérifier le nom exact du fichier `.env.local` et les deux noms de variables.
- **Caméra refusée** : autoriser la caméra pour localhost dans les paramètres du navigateur ; vérifier aussi qu'aucune autre application ne l'utilise.
- **Port 3000 occupé** : arrêter l'autre serveur ou lancer `npm run dev -- -p 3001`.

## Services distants — étapes manuelles

Le dépôt ne peut pas créer ni configurer à ta place un projet Supabase ou un déploiement Vercel. Avant une mise en production, vérifier dans Supabase le schéma/migrations, les policies RLS et le compte administrateur, puis configurer les mêmes variables dans les paramètres Vercel. Ne jamais utiliser de vraies données d'élèves pour les tests locaux.
