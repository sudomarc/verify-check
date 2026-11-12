# Cookies and Storage

## Principe

Ne pas ajouter des cookies parce qu'une checklist mentionne les cookies.

Inventorier d'abord ce que l'application stocke ou fait stocker par des tiers.

Cookies, localStorage, sessionStorage, IndexedDB, caches de service worker et sessions serveur sont des mécanismes distincts.

## Inventaire

Rechercher :
- document.cookie ;
- Set-Cookie ;
- helpers de session/cookie ;
- localStorage ;
- sessionStorage ;
- IndexedDB ;
- service workers et Cache API ;
- analytics/replay SDKs ;
- pixels et tags marketing ;
- embeds tiers.

Puis vérifier le comportement runtime et réseau lorsque possible.

## Classification

Chaque mécanisme doit être classé :
- nécessaire technique ;
- authentification/session ;
- sécurité/anti-abus ;
- préférence ;
- analytics ;
- publicité/marketing ;
- inconnu.

Documenter : but, clé/nom, durée, portée, données, writer, reader, destination.

## Aucun consent manager nécessaire

Si le projet ne possède pas de cookies ou trackers non essentiels pertinents :
- ne pas fabriquer une fausse expérience de cookie consent ;
- documenter l'absence ;
- auditer quand même les ressources tierces ;
- une notice informative peut expliquer les ressources externes, mais ne remplace jamais un consentement lorsqu'il est requis.

## Consent system nécessaire

Lorsque des cookies/tracking non essentiels nécessitent un contrôle :
- catégories explicites ;
- accepter tout ;
- refuser tout ;
- gérer les choix si le contexte l'exige ;
- finalités et fournisseurs compréhensibles ;
- absence de technologies bloquées avant le choix lorsque requis ;
- persistance du choix ;
- révocation/modification ;
- version du consentement ;
- gating centralisé.

Ne pas coder une conclusion juridique comme une simple règle universelle.

## Cookies de session

Pour l'authentification ou l'état sensible, vérifier selon l'architecture :
- Secure ;
- HttpOnly quand JS n'en a pas besoin ;
- SameSite approprié ;
- Path/Domain minimisés ;
- expiration/max-age ;
- rotation/invalidation ;
- protections CSRF pour les mutations concernées.

## Browser storage

Le stockage navigateur convient surtout aux préférences non sensibles.

Ne jamais y stocker :
- API keys ;
- mots de passe ;
- secrets d'authentification persistants ;
- données personnelles sensibles par simple confort ;
- contenu brut de formulaires sensibles.

Ne jamais mettre de secret ou donnée sensible dans une query string.

## Third parties

Tracer :
resource → request → data exposure → storage behavior → consent gate → fallback

Une ressource tierce chargée avant le consentement peut contourner une interface de consentement apparemment correcte.

## Vérification

Pour chaque mécanisme :
- preuve source ;
- preuve runtime si possible ;
- classification ;
- contrôle attendu ;
- état de vérification ;
- incertitude restante.
