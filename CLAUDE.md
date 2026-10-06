# rails-folio — Portfolio Fabien Hoarau

## Contexte
Portfolio freelance (graphiste / motion / UI / front). Cible : agences et studios.
V2 en cours sur la branche `v2-front` (V1 taguée `v1.0`) : on refait le FRONT, on garde les PROJETS.

## Stack
- Ruby on Rails 7.1, Bootstrap, Stimulus.js, importmap
- Animations : GSAP (+ ScrollTrigger, SplitText) et Lenis, pinnés via importmap
- Pas de base de données (site statique)
- Médias sur Cloudinary (f_auto, q_auto)
- Déploiement Heroku : `git push heroku master` (pas main)
- Preview locale : `bin/dev`

## Direction artistique V2
Ton : clair, chaleureux, accueillant. Les interactions et animations sont le cœur du site.
- Titres : ClashDisplay
- Texte, nav, tags, numéros : Fragment Mono (une seule graisse : Regular + Italique)
- Couleurs (variables SCSS) :
  - fond `#F6F1E7`
  - texte `#1C1A17`
  - accent `#FF5A36` (bandes, badges, survols, formes — jamais pour du texte courant)
  - secondaire `#FFD8C2`
- Refs détaillées : docs/refs/refs.md

## Animations
- Une animation = un controller Stimulus (ex : reveal, marquee, magnetic)
- Courbes douces, léger rebond (`back.out`), pas d'effet nerveux
- Toujours respecter `prefers-reduced-motion`

## Règles
- Toujours résumer la demande et proposer un plan AVANT de coder, puis attendre validation.
- Simplicité avant optimisation. Pas de refacto du stockage des projets.
- Ne pas toucher aux données projets ni aux public_id Cloudinary.
- Pas d'autre police que ClashDisplay et Fragment Mono.
- Responsive obligatoire (mobile first).
- AVANT toute suppression : lister l'arbo (`ls`, `git status`) et demander confirmation.
- Petites étapes, une étape = un commit.
- Répondre en français, contenu du site en français sans anglicismes inutiles.

## Pages
home, page projet (template unique), about (à adapter à la nouvelle DA), mentions légales (/mentions-legales).

## Projets
Slides, MAC VAL, La Colline, Ford, Mango Edition, TF1 (à récupérer), projets indépendants & expérimentations.
