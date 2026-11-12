# Static Site Blueprint

Utiliser pour HTML/CSS/JavaScript statique ou architecture static-first.

## Structure fonctionnelle recommandée

project/
  index.html
  pages métier
  404.html ou équivalent hébergeur
  partials/ ou shared-components/
    header
    footer
  assets/
    css/
    js/
    img/ ou media/
    fonts/ si justifiées
  data/ ou content/
  docs/
  robots.txt
  sitemap.xml lorsque l'URL publique est vérifiée
  favicon/app icons
  hosting config
  README.md
  ROADMAP.md
  AGENTS.md ou équivalent
  .github/pull_request_template.md si utilisé

La liste de noms est indicative. Les responsabilités sont obligatoires seulement lorsqu'elles sont applicables.

## CSS partagé

La couche de base peut contenir :
- design tokens ;
- reset ;
- typographie ;
- defaults formulaires ;
- focus ;
- utilities accessibilité ;
- primitives partagées.

Séparer les styles par surface lorsque cela rend les changements plus locaux et vérifiables.

## JavaScript partagé

Séparer autant que possible :
- shell/includes ;
- navigation ;
- motion ;
- stockage/consent ;
- formulaires ;
- rendu de données métier.

Éviter un script global qui mélange des responsabilités sans lien.

## Contenu data-driven

Pour services, projets, produits et autres collections répétées :
- une source de vérité ;
- validation de schéma ;
- identifiants uniques ;
- états loading/error/empty ;
- rendu séparé du contenu lorsque cela réduit la duplication.

## Continuité des parcours

Pour un workflow multi-page, préférer :
source selection → validated identifier → destination prefill

Exemple conceptuel :
services → contact?service=validated-id

Valider l'identifiant avant utilisation.

## Outils de vérification

Un projet statique peut inclure des smoke scripts pour :
- existence des routes ;
- liens ;
- metadata obligatoire ;
- responsive/overflow ;
- échecs d'assets.

Ces scripts sont des aides et ne remplacent pas le browser QA.
