# Carte du projet

Ce document sert à se repérer dans le code du portfolio quand on l’ouvre dans VS Code.
Il ne demande pas de connaître Rails : il dit où se trouve chaque chose et comment la modifier sans casser le reste.

---

## 1. Les langages en un coup d’œil

| Extension | Langage | À quoi ça sert ici |
|---|---|---|
| `.rb` | Ruby | La logique côté serveur : routes, contrôleurs, listes de projets, configuration. |
| `.html.erb` | HTML + ERB | Les pages. Le HTML est normal ; tout ce qui est entre `<% %>` ou `<%= %>` est du Ruby inséré dans la page. `<%# … %>` est un commentaire. |
| `.scss` | SCSS (Sass) | Les styles. Du CSS avec des variables (`$color-text`), des imbrications et des « mixins » (`@include respond-to(md)`). |
| `.js` | JavaScript (Stimulus) | Les animations et les interactions. Un fichier = un « controller » Stimulus, branché sur le HTML avec `data-controller="…"`. |
| `.yml` | YAML | Des listes de réglages. Ici surtout la correspondance image locale → image Cloudinary. |
| `.md` | Markdown | La documentation (ce fichier, le plan V2). |

---

## 2. L’arborescence utile

Seuls les dossiers dans lesquels on travaille vraiment sont listés.

```
rails-folio/
├── app/
│   ├── views/                    ← les pages (ERB)
│   │   ├── layouts/application.html.erb   squelette commun : <head>, nav, <main>, footer
│   │   ├── shared/               nav (_navbar) et footer (_footer), inclus dans le squelette
│   │   ├── home/index.html.erb   la page d’accueil
│   │   ├── projects/             une page par projet + 4 morceaux communs (fichiers qui commencent par _)
│   │   ├── pages/                À propos, contact, mentions légales
│   │   └── contact_mailer/       le contenu du mail reçu quand quelqu’un remplit le formulaire
│   ├── assets/
│   │   ├── stylesheets/          ← les styles (SCSS)
│   │   │   ├── _tokens.scss      couleurs, polices, rayons, durées : LE fichier à modifier pour changer l’identité
│   │   │   ├── application.scss  point d’entrée : charge les tokens, Bootstrap (CSS seulement), les polices, puis components/
│   │   │   └── components/       un fichier par zone du site (home, nav, footer, projet…)
│   │   ├── fonts/                ClashDisplay et Fragment Mono (auto-hébergées)
│   │   └── images/               le CV en PDF (les images du site sont sur Cloudinary)
│   ├── javascript/
│   │   ├── application.js        point d’entrée JS : charge Turbo et tous les controllers
│   │   └── controllers/          ← une animation ou une interaction = un fichier *_controller.js
│   ├── helpers/
│   │   ├── projects_helper.rb    la LISTE DES PROJETS (ordre, nom, tags, contexte, rôle) et l’affichage des médias
│   │   └── medias_helper.rb      fabrique les balises <img> / <video> Cloudinary (tailles, srcset)
│   ├── controllers/              reçoivent les requêtes ; presque vides, sauf contacts_controller.rb (envoi du formulaire)
│   ├── models/contact.rb         les règles du formulaire (champs obligatoires, 10 caractères minimum)
│   └── mailers/contact_mailer.rb qui envoie le mail, à qui, avec quel sujet
├── config/
│   ├── routes.rb                 les adresses du site (/a-propos, /projects/ford…)
│   ├── importmap.rb              la liste des bibliothèques JS (GSAP, Lenis, Turbo, Stimulus) : pas de npm
│   ├── cloudinary_assets.yml     correspondance « chemin d’image » → image Cloudinary (avec largeur et hauteur)
│   ├── environments/production.rb   réglages du site en ligne (dont l’envoi des mails par Gmail)
│   └── initializers/             réglages chargés au démarrage (Cloudinary, filtrage des logs…)
├── docs/                         plan V2, références, cette carte
└── lib/tasks/cloudinary.rake     outil de l’étape 7 qui a envoyé les images sur Cloudinary
```

---

## 3. Ce que je vois à l’écran → fichiers

### Partout

| À l’écran | Structure (HTML) | Style | Comportement (JS) |
|---|---|---|---|
| Lien « Aller au contenu » (visible au premier Tab) | `app/views/layouts/application.html.erb` | `app/assets/stylesheets/components/_navbar.scss` (`.lien-evitement`) | `app/javascript/controllers/smooth_scroll_controller.js` (`evitement`) |
| Nav pilule (desktop) | `app/views/shared/_navbar.html.erb` | `app/assets/stylesheets/components/_navbar.scss` | `app/javascript/controllers/nav_controller.js` (se replie au défilement) |
| Menu mobile plein écran | `app/views/shared/_navbar.html.erb` (`#nav-panel`) | `app/assets/stylesheets/components/_navbar.scss` (`.nav-panel`) | `app/javascript/controllers/nav_controller.js` (ouverture, Échap, focus, `inert`) |
| Footer : bande tomate qui défile (marquee) | `app/views/shared/_footer.html.erb` | `app/assets/stylesheets/components/_footer.scss` (`.footer-band`) | `app/javascript/controllers/marquee_controller.js` |
| Footer : « Un projet en tête ? », e-mail, colonnes | `app/views/shared/_footer.html.erb` | `app/assets/stylesheets/components/_footer.scss` | `app/javascript/controllers/magnetic_controller.js` (e-mail aimanté) |
| Fondu entre les pages et petit loader | `app/views/layouts/application.html.erb` (`#app-loader`, `#page-overlay`) | `app/assets/stylesheets/components/_transition.scss`, `app/assets/stylesheets/components/_loader.scss` | `app/javascript/controllers/transition_controller.js` |
| Défilement doux | — | `app/assets/stylesheets/components/_lenis.scss` | `app/javascript/controllers/smooth_scroll_controller.js` (Lenis) |
| Titre de l’onglet du navigateur | `app/views/layouts/application.html.erb` (repli) + `content_for :titre` dans chaque page | — | — |

### Page d’accueil

| À l’écran | Structure | Style | Comportement |
|---|---|---|---|
| Hero : « FABIEN HOARAU », accroche, bouton « ↓ projets » | `app/views/home/index.html.erb` | `app/assets/stylesheets/components/_home.scss` (`.home-hero`) | `app/javascript/controllers/split_title_controller.js` (lettres qui montent), `app/javascript/controllers/magnetic_controller.js` (bouton) |
| Bande « graphisme → motion → UI → front » | `app/views/home/index.html.erb` (liste `disciplines` en haut du fichier) | `app/assets/stylesheets/components/_home.scss` (`.home-disciplines`) | `app/javascript/controllers/disciplines_controller.js` |
| Liste des projets (numéro, nom, tags, flèche) | `app/views/home/index.html.erb`, données dans `app/helpers/projects_helper.rb` | `app/assets/stylesheets/components/_home.scss` (`.project-row`, `.tag-pill`) | `app/javascript/controllers/reveal_controller.js` (apparition) |
| Aperçu d’image au survol d’un projet | `app/views/home/index.html.erb` (`.project-preview`), images dans `app/helpers/projects_helper.rb` (`images:`) | `app/assets/stylesheets/components/_home.scss` | `app/javascript/controllers/project_preview_controller.js` |

### Pages projet

Chaque projet a sa page dans `app/views/projects/` (par exemple `app/views/projects/ford.html.erb`). Elle assemble quatre morceaux communs :

| À l’écran | Morceau (partial) | Style | Comportement |
|---|---|---|---|
| « ← tous les projets », numéro 07 / 08, grand titre, tags, texte, contexte et rôle | `app/views/projects/_entete.html.erb` (titre, tags, contexte, rôle viennent de `app/helpers/projects_helper.rb` ; le texte vient de la page du projet) | `app/assets/stylesheets/components/_projet.scss` (`.projet-entete`) | `app/javascript/controllers/split_title_controller.js` (mots du titre) |
| Image ou vidéo pleine largeur | `app/views/projects/_media_pleine.html.erb` | `app/assets/stylesheets/components/_projet.scss` (`.projet-media--pleine`) | `app/javascript/controllers/video_boucle_controller.js` pour les vidéos |
| Deux images côte à côte (carrées) | `app/views/projects/_media_paire.html.erb` | `app/assets/stylesheets/components/_projet.scss` (`.projet-media--paire`) | — |
| Bouton « lecture / pause » sur les vidéos et GIF animés | ajouté par le JS | `app/assets/stylesheets/components/_projet.scss` (`.video-boucle__bouton`) | `app/javascript/controllers/video_boucle_controller.js` |
| « ← précédent / suivant → » | `app/views/projects/_navigation.html.erb` | `app/assets/stylesheets/components/_projet.scss` (`.projet-nav`) | `app/javascript/controllers/magnetic_controller.js` |

Le choix de la balise (image, image Cloudinary, vidéo, GIF) se fait dans `projet_media` de `app/helpers/projects_helper.rb` ; la fabrication des balises dans `app/helpers/medias_helper.rb`.

### Autres pages

| À l’écran | Structure | Style | Comportement |
|---|---|---|---|
| À propos (portrait, texte, outils, liens) | `app/views/pages/a_propos.html.erb` | `app/assets/stylesheets/components/_a_propos.scss` | `app/javascript/controllers/reveal_controller.js` |
| Contact : colonne de gauche et formulaire | `app/views/pages/contact.html.erb` | `app/assets/stylesheets/components/_contact.scss` | `app/javascript/controllers/formulaire_controller.js` (vérification des champs, messages) |
| Contact : envoi du message | `app/controllers/contacts_controller.rb` → `app/mailers/contact_mailer.rb` → `app/views/contact_mailer/contact_email.html.erb` | — | règles des champs : `app/models/contact.rb` ; réglages Gmail : `config/environments/production.rb` |
| Mentions légales | `app/views/pages/mentions_legales.html.erb` | `app/assets/stylesheets/components/_legal.scss` | — |

### Les animations, une par une

Toutes respectent le réglage « réduire les animations » du système (`prefers-reduced-motion`).

| Animation | Fichier | Branchée dans le HTML par |
|---|---|---|
| Lettres ou mots des grands titres qui montent | `app/javascript/controllers/split_title_controller.js` | `data-controller="split-title"` |
| Blocs qui apparaissent au défilement | `app/javascript/controllers/reveal_controller.js` | `data-reveal-target="item"` (le controller est sur `<main>`) |
| Bande des disciplines | `app/javascript/controllers/disciplines_controller.js` | `data-controller="disciplines"` |
| Bande tomate du footer | `app/javascript/controllers/marquee_controller.js` | `data-controller="marquee"` |
| Éléments aimantés par la souris | `app/javascript/controllers/magnetic_controller.js` | `data-controller="magnetic"` |
| Aperçu d’image qui suit la souris | `app/javascript/controllers/project_preview_controller.js` | `data-controller="project-preview"` |
| Défilement doux | `app/javascript/controllers/smooth_scroll_controller.js` | `data-controller="smooth-scroll"` sur `<html>` |
| Fondu entre les pages | `app/javascript/controllers/transition_controller.js` | `data-controller="transition"` sur `<body>` |
| Vidéos en boucle | `app/javascript/controllers/video_boucle_controller.js` | ajouté automatiquement par `app/helpers/medias_helper.rb` |
| Nav qui se replie, menu mobile | `app/javascript/controllers/nav_controller.js` | `data-controller="nav"` |
| Point « disponible » qui pulse 2 fois | `app/assets/stylesheets/components/_navbar.scss` (`nav-dot-pulse`) | classe `nav-pill__dot` |

---

## 4. Se repérer tout seul en trois gestes

1. Dans le navigateur, clic droit sur l’élément → **Inspecter**.
2. Dans le code qui s’affiche, repérer :
   - un `data-controller="…"` (par exemple `marquee`) → le fichier JS s’appelle `marquee_controller.js` (les tirets deviennent des `_`) ;
   - ou une classe CSS (par exemple `class="project-row"`).
3. Dans VS Code, **Cmd + Maj + F** (recherche dans tout le projet) et taper ce nom (`project-row`). On tombe sur la vue (`.html.erb`) et sur le style (`.scss`).

Astuce : les noms de classes suivent la forme `bloc__element--variante` (par exemple `projet-media__cadre--recadre`). Le bloc (`projet-media`) indique en général le fichier SCSS (`_projet.scss`).

---

## 5. Recettes pas à pas

### Lancer le serveur

1. Ouvrir un terminal dans VS Code (menu Terminal → Nouveau terminal).
2. Taper `bin/rails server`.
3. Ouvrir http://localhost:3000 dans le navigateur.
4. Pour arrêter : **Ctrl + C** dans le terminal.

Les modifications de vues, de SCSS et de JS sont prises en compte en rechargeant la page. Les modifications dans `config/` (routes, initializers, importmap) demandent de relancer le serveur.

### Modifier un texte

- Texte d’une page (accroche, paragraphes, mentions…) : directement dans la vue (`app/views/…/*.html.erb`), entre les balises HTML.
- Nom, tags, contexte ou rôle d’un projet : dans `app/helpers/projects_helper.rb` (liste `PROJETS`).
- Texte de présentation d’un projet : dans sa page, par exemple `app/views/projects/ford.html.erb`, dans le bloc `render layout: "projects/entete"`.
- Messages du formulaire : `app/models/contact.rb` (côté serveur) **et** `app/javascript/controllers/formulaire_controller.js` (côté navigateur) ; garder les deux identiques.
- Typographie française : apostrophe courbe `’`, espace avant `: ; ? !`, guillemets `« »`.

### Changer une couleur ou une taille

Tout est dans `app/assets/stylesheets/_tokens.scss` :
- couleurs : `$color-bg`, `$color-text`, `$color-accent` (tomate), `$color-secondary` (pêche) ;
- taille des titres de page (À propos, Contact, Mentions) : `$font-size-titre-page` ;
- arrondis, durées et courbes d’animation.

Changer la valeur à cet endroit la change partout. Une taille propre à une zone se modifie dans le fichier de la zone (`app/assets/stylesheets/components/…`). Puis lancer le test de build (voir les pièges).

### Remplacer une image existante (même cadrage)

1. Sur Cloudinary, retrouver l’image : son nom (public_id) est dans `config/cloudinary_assets.yml`, par exemple `portfolio/ford/couverture`.
2. Envoyer le nouveau fichier sur Cloudinary **avec le même public_id** (option « remplacer »). Ne pas renommer ni déplacer l’image : le site ne la retrouverait plus.
3. Si les proportions changent, mettre à jour `width` et `height` de cette image dans `config/cloudinary_assets.yml`.

### Ajouter une image dans une page projet

1. Envoyer l’image sur Cloudinary, dans le dossier du projet (par exemple `portfolio/ford/`), et noter son public_id, sa largeur et sa hauteur.
2. Ajouter une entrée dans `config/cloudinary_assets.yml`, sur le modèle des autres :
   ```yaml
   ford/nouvelle-image.jpg:
     public_id: portfolio/ford/nouvelle-image
     format: jpg
     width: 2000
     height: 1500
   ```
3. Dans la page du projet, ajouter un bloc, par exemple une image pleine largeur :
   ```erb
   <%= render "projects/media_pleine",
         media: { image: "ford/nouvelle-image.jpg", alt: "Description de l’image" } %>
   ```
   Ou deux images côte à côte avec `render "projects/media_paire", medias: [ {…}, {…} ]`.
4. Le texte `alt` décrit l’image pour les personnes qui ne la voient pas : toujours le remplir.

### Ajouter un projet

1. **Données** : dans `app/helpers/projects_helper.rb`, ajouter un bloc dans `PROJETS` (copier celui de Ford). Le `slug` est le nom court sans espace ni accent (par exemple `nouveau_projet`). La position dans la liste donne l’ordre sur la home et le numéro.
2. **Adresse** : dans `config/routes.rb`, ajouter `get 'projects/nouveau_projet', to: 'projects#nouveau_projet'`.
3. **Contrôleur** : dans `app/controllers/projects_controller.rb`, ajouter une action vide :
   ```ruby
   def nouveau_projet
   end
   ```
4. **Page** : copier `app/views/projects/ford.html.erb` en `app/views/projects/nouveau_projet.html.erb`, puis changer le texte et les médias.
5. Relancer le serveur (la route a changé) et ouvrir http://localhost:3000/projects/nouveau_projet.

### Désactiver une animation

- Sur un seul élément : retirer son `data-controller="…"` (ou `data-reveal-target="item"` pour une apparition) dans la vue.
- Partout : retirer `data-controller` de la balise qui le porte (voir le tableau des animations), ou supprimer la ligne correspondante si elle est dans `app/views/layouts/application.html.erb`.
- Pour tester le site sans aucune animation : activer « Réduire les animations » dans les réglages d’accessibilité du Mac. Toutes les animations s’arrêtent.

---

## 6. Les pièges

- **Tester le build après toute modification SCSS.** Le site en ligne compresse les styles autrement qu’en local. Après chaque changement de `.scss`, lancer :
  `RAILS_ENV=production SECRET_KEY_BASE=dummy bin/rails assets:precompile`
  Il doit finir sans erreur. Puis `bin/rails assets:clobber` pour effacer les fichiers générés (ils ne doivent pas être commités).
- **Pas de `min()` ni de `max()` avec des unités mélangées en Sass** (par exemple `min(5.5rem, 30vw)`). Le build de production casse. Utiliser `clamp()` ou `calc()` : `clamp(0px, 30vw, 5.5rem)` fait la même chose.
- **Pas de npm.** Il n’y a ni `package.json` ni `node_modules`. Les bibliothèques JS sont déclarées dans `config/importmap.rb` (commande `bin/importmap pin …`), le CSS de Bootstrap vient d’une gem Ruby.
- **Lenis est le seul défilement doux.** Ne pas ajouter `scroll-behavior: smooth` en CSS ni une autre bibliothèque de défilement : les deux se battraient (Bootstrap est réglé avec `$enable-smooth-scroll: false` dans `app/assets/stylesheets/application.scss`).
- **Le tomate n’est jamais le seul repère sur le crème.** Sur fond crème, le tomate est trop pâle pour être lu (contraste 2,76:1). Il sert de fond (avec du texte encre par-dessus), de bande ou de forme décorative. Un état important (page en cours, lien, erreur) a toujours aussi un repère en encre : soulignement, contour, pictogramme.
- **Ne pas renommer les images sur Cloudinary** (public_id) : le site les retrouve par ce nom.
- **Un projet = cinq endroits** (helper, route, contrôleur, page, images) : en oublier un donne une page d’erreur.
