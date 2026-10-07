module ProjectsHelper
  # Liste des projets, dans l'ordre de la home (et de la navigation précédent / suivant) :
  # projets récents d'abord, projets d'école (Shelfie, Slides) en dernier.
  # images : aperçu au survol de la home (1 ou 2) ; { video:, seconde: } = image fixe tirée d'une vidéo.
  PROJETS = [
    { slug: "metropole-grand-paris", nom: "Métropole du Grand Paris", tags: %w[identité],
      etiquettes: ["PVV / Tremplin Numérique", "Identité visuelle", "2022 / 2025", "Équipe de 15 personnes"],
      images: %w[metropole-grand-paris/agoras-salle.png],
      role: "Responsable du pôle graphisme",
      duree: "3 ans et demi",
      outils: "Illustrator · InDesign · Photoshop · After Effects · Premiere Pro",
      blocs: [
        { titre: "Contexte", items: [
          "Agence PVV, partenariat Bluenove",
          "Client final : Métropole du Grand Paris",
          "Cycle de 10 événements urbains sur 1 an",
          "Thématique : enjeux et avenir de la ville",
          "20 à 30 participants par journée, profils institutionnels"
        ] },
        { titre: "Direction artistique", items: [
          "Proposition et application de la DA sur tous les supports",
          "Direction artistique reconduite sur l’ensemble du cycle",
          "Coordination créative entre 4 pôles de production",
          "Cohérence visuelle maintenue sur tous les supports et formats"
        ] },
        { titre: "Production", items: [
          "Habillage motion pour intégration vidéo",
          "Kakémono et supports print grand format",
          "Visuels de communication avant et après événement",
          "Documentation Behance publiée en fin de conférence"
        ] },
        { titre: "Résultats", items: [
          "Responsable d’une équipe de 15 personnes",
          "Coordination des pôles photo, motion et vidéo",
          "Supervision des livrables de chaque pôle",
          "Garant de la cohérence DA sur l’ensemble des productions"
        ] }
      ] },
    { slug: "beach-bikes", nom: "Beach Bikes Arcachon", tags: %w[UI dev],
      etiquettes: ["Freelance", "Interface B2B", "Mission en cours", "Équipe de 6 personnes"],
      images: %w[beach-bikes/reservations.png],
      role: "UI designer · Développeur front & back",
      duree: "Production en cours",
      outils: "Figma · Ruby on Rails · Stimulus · SQL",
      blocs: [
        { titre: "Contexte", items: [
          "Process métier initialement géré sur tableur",
          "Forte volumétrie (500+ assets)",
          "Besoin de centralisation multi-canaux",
          "Environnement évolutif avec contraintes opérationnelles"
        ] },
        { titre: "UI / Design system", items: [
          "Conception de wireframes et maquettes haute fidélité orientées usage métier",
          "Création d’un design system adapté aux interfaces riches en données",
          "Itérations continues avec le client, en logique agile",
          "Collaboration avec le développement pour une intégration cohérente"
        ] },
        { titre: "Fonctionnalités clés", items: [
          "Gestion en temps réel des stocks",
          "Synchronisation des réservations multi-sources",
          "Système d’alertes (maintenance, disponibilité)",
          "Interface de gestion multi-points"
        ] },
        { titre: "Livrables", items: [
          "Design system exploitable et documenté",
          "Interfaces UI prêtes à intégrer",
          "Code de production aligné avec les maquettes",
          "Passation complète avec spécifications et suivi client"
        ] }
      ] },
    { slug: "atelier-reli-art", nom: "Atelier Reli’Art", tags: %w[identité],
      etiquettes: ["Freelance", "Identité visuelle", "2025"],
      images: %w[atelier-reli-art/proposition-1.png],
      role: "Directeur artistique",
      duree: "5 mois",
      outils: "Illustrator · Photoshop",
      blocs: [
        { titre: "Contexte", items: [
          "Lancement d’une structure artisanale",
          "Contrainte couleur imposée : rouge, noir, blanc",
          "Besoin d’une identité polyvalente, print et réseaux sociaux"
        ] },
        { titre: "Identité visuelle", items: [
          "3 propositions de logotype avec intentions rédigées",
          "Logotype variable avec déclinaisons fond clair, fond sombre et version compacte"
        ] },
        { titre: "Résultats", items: [
          "Identité immédiatement reconnaissable et mémorable",
          "Système graphique déclinable sur Instagram et en print sans adaptation technique",
          "Client autonome sur ses supports de communication"
        ] },
        { titre: "Livrables", items: [
          "Charte graphique complète avec intention documentée",
          "Fichiers sources du logotype, toutes déclinaisons",
          "Prêt à déployer sur Instagram et supports imprimés"
        ] }
      ] },
    { slug: "tf1", nom: "TF1 — E-learning", tags: %w[motion UI],
      images: ["tf1/lou.png", { video: "teaser_nfmktr", seconde: 2 }],
      etiquettes: ["Tremplin Numérique", "Module e-learning", "2024 / 2025"],
      role: "Motion designer · UI designer",
      duree: "6 mois",
      outils: "After Effects · Illustrator · Figma",
      blocs: [
        { titre: "Contexte", items: [
          "Commande du Groupe TF1 via l’agence",
          "Public : professionnels de l’audiovisuel",
          "Sujet : une production plus responsable",
          "Équipe à plusieurs intervenants"
        ] },
        { titre: "Motion", items: [
          "Motion design typographique",
          "Composition des scènes animées",
          "Intégration des animations de personnages (réalisées par un collègue)"
        ] },
        { titre: "Interface", items: [
          "Mise en page des écrans du module",
          "Hiérarchie claire pour un contenu dense",
          "Cohérence entre animations et interface"
        ] },
        { titre: "Livrables", items: [
          "Teaser du module",
          "Quiz animés (échecs, mots croisés)",
          "Écrans mis en page"
        ] }
      ] },
    { slug: "la_colline", nom: "La Colline", tags: %w[packaging illustration],
      images: %w[lacolline/Glass_Oil_Bottle_2.jpg lacolline/mobile2.jpg],
      etiquettes: ["Freelance", "Identité, packaging & web", "2022"],
      role: "Directeur artistique · UI designer",
      duree: "4 mois",
      outils: "Illustrator · Figma · WordPress · Elementor",
      blocs: [
        { titre: "Contexte", items: [
          "Lancement d’une marque d’huile d’olive",
          "Collaboration directe avec le client",
          "Une identité cohérente, de la bouteille au site"
        ] },
        { titre: "Identité & illustration", items: [
          "Logotype et palette méditerranéenne",
          "Illustrations linéaires sur la production",
          "Le cheval, symbole de la marque"
        ] },
        { titre: "Packaging & print", items: [
          "Étiquettes de la gamme",
          "Déclinaisons imprimées"
        ] },
        { titre: "Web", items: [
          "Maquettes et design system sous Figma",
          "Intégration du site sous WordPress (Elementor)"
        ] }
      ] },
    { slug: "macval", nom: "MAC VAL", tags: %w[identité motion],
      images: %w[macval/Branding_Mockup_2.jpg macval/magnet.jpg],
      etiquettes: ["Projet d’école", "Proposition d’identité", "2023"],
      role: "Conception complète",
      duree: "4 mois",
      outils: "Illustrator · InDesign · Photoshop",
      blocs: [
        { titre: "Contexte", items: [
          "Exercice de refonte d’identité d’un musée existant",
          "Public large, de l’amateur au spécialiste",
          "Un système à décliner du web à la signalétique"
        ] },
        { titre: "Identité", items: [
          "Logo manuscrit tracé à la main",
          "Le rectangle-porte comme fil conducteur",
          "Version animée du logo"
        ] },
        { titre: "Déclinaisons", items: [
          "Affiches d’exposition",
          "Papeterie",
          "Badges",
          "Signalétique intérieure",
          "Bandeau web"
        ] },
        { titre: "Livrables", items: [
          "Logo fixe et animé",
          "Supports imprimés et signalétique",
          "Mises en situation"
        ] }
      ] },
    { slug: "mango", nom: "Mango Édition", tags: %w[identité motion],
      images: %w[mango/livre-2.jpg mango/tote.jpg],
      etiquettes: ["Projet d’école", "Proposition d’identité", "2020"],
      role: "Conception complète",
      duree: "2 mois",
      outils: "Illustrator · InDesign · Photoshop · After Effects",
      blocs: [
        { titre: "Contexte", items: [
          "Refonte d’identité d’un éditeur existant",
          "Un catalogue large : cuisine, loisirs, pratique",
          "Un signe fort et lisible sur les couvertures"
        ] },
        { titre: "Identité", items: [
          "Logo circulaire",
          "Version animée",
          "Couleurs vives"
        ] },
        { titre: "Déclinaisons", items: [
          "Cartes de visite",
          "Couvertures de livres",
          "Sac en toile"
        ] },
        { titre: "Livrables", items: [
          "Logo fixe et animé",
          "Mises en situation édition et objets"
        ] }
      ] },
    { slug: "ford", nom: "Ford", tags: %w[édition],
      images: %w[ford/Mockup_Ford.jpg ford_couv.jpg],
      etiquettes: ["Proposition éditoriale", "Brochure", "2021"],
      role: "Conception complète",
      duree: "3 mois",
      outils: "Illustrator · InDesign · Photoshop",
      blocs: [
        { titre: "Contexte", items: [
          "Proposition de livrable éditorial sur l’histoire d’une marque",
          "Plus d’un siècle d’archives à hiérarchiser"
        ] },
        { titre: "Direction artistique", items: [
          "Hommage graphique à Paul Rand",
          "Lettres découpées en couverture",
          "Typographies colorées"
        ] },
        { titre: "Mise en page", items: [
          "Doubles pages chronologiques",
          "Photos d’archives",
          "Grille éditoriale"
        ] },
        { titre: "Livrables", items: [
          "Couverture",
          "Brochure complète",
          "Mises en situation"
        ] }
      ] },
    { slug: "abskate", nom: "Abécédaire", tags: %w[édition],
      images: %w[abc/livre.jpg abskate_couv.jpg],
      contexte: "Projet éditorial",
      role: "Conception complète : direction artistique, mise en page" },
    { slug: "shelfie", nom: "Shelfie", tags: %w[UI dev],
      images: %w[shelfie/3840154.jpg],
      contexte: "Projet d’équipe, Le Wagon",
      role: "Direction artistique et développement front" },
    { slug: "slides", nom: "Slides", tags: %w[identité motion],
      images: ["slides/slide_branding_31.jpg", "slides/MU 1.jpg"],
      contexte: "Projet de diplôme",
      role: "Conception complète : identité, affiches, scénographie" }
  ].freeze

  def projets
    PROJETS
  end

  def projet_path_for(projet)
    "/projects/#{projet[:slug]}"
  end

  # Projet de la page en cours (une action = un projet ; slug « a-b » → action « a_b »)
  def projet_courant
    @projet_courant ||= PROJETS.find { |p| p[:slug].tr("-", "_") == action_name }
  end

  # Un média s'affiche seulement s'il existe : une image locale (chemin) doit figurer dans
  # config/cloudinary_assets.yml (les fichiers ne sont plus dans app/assets/images).
  # Les autres sources (public_id Cloudinary, vidéo) sont toujours disponibles.
  def media_disponible?(media)
    chemin = media.is_a?(Hash) ? media[:image] : media
    return true unless chemin.is_a?(String)

    media_cloudinary(chemin).present?
  end

  # URL de l'aperçu au survol de la home : première image disponible, sinon rien
  def projet_apercu_url(projet)
    image = projet[:images].find { |i| media_disponible?(i) }
    media_image_url(image, largeur: 800) if image
  end

  # Bloc de médias tolérant aux absents : 2 disponibles → paire, 1 → pleine largeur
  # (etroit : demi-largeur centrée dès md), 0 → rien
  def projet_bloc_medias(*medias, ratio: nil, etroit: false)
    presents = medias.select { |m| media_disponible?(m) }
    case presents.size
    when 0 then nil
    when 1 then render("projects/media_pleine", media: presents.first, ratio: ratio, etroit: etroit)
    else render("projects/media_paire", medias: presents.first(2))
    end
  end

  def projet_numero(projet)
    format("%02d", PROJETS.index(projet) + 1)
  end

  # Voisins dans la liste, en boucle
  def projet_voisin(projet, decalage)
    PROJETS[(PROJETS.index(projet) + decalage) % PROJETS.size]
  end

  # Affichage seulement : pas de coupure à « E-learning » ni avant le tiret
  def nom_insecable(nom)
    nom.gsub("-", "\u2011").gsub(" — ", "\u00A0— ")
  end

  # Un média de page projet :
  #   { image: "ford/x.jpg", alt: "…" }            image locale
  #   { cl_image: "public_id", alt: "…" }          image Cloudinary
  #   { cl_gif: "public_id", width:, height: }     GIF animé Cloudinary, servi en vidéo
  #   { video: "public_id", alt: "…" }             vidéo Cloudinary en boucle muette (voir media_video_tag)
  #   { video: "public_id", lecteur: true }        … avec lecteur, chargée au clic (largeur:, attente:, muet: en option)
  # sizes : largeur affichée, pour le srcset des images Cloudinary (MediasHelper)
  def projet_media(media, sizes: "100vw")
    if media[:image]&.end_with?(".gif")
      media_gif_tag media[:image], alt: media[:alt], class: "projet-media__el"
    elsif media[:image]
      media_image_tag media[:image], alt: media[:alt], sizes: sizes,
                      width: media[:width], height: media[:height], class: "projet-media__el"
    elsif media[:cl_gif]
      media_gif_video_tag media[:cl_gif], alt: media[:alt], largeur: media[:width],
                          width: media[:width], height: media[:height], class: "projet-media__el"
    elsif media[:cl_image]
      cl_image_tag media[:cl_image], alt: media[:alt], loading: "lazy", class: "projet-media__el",
                   fetch_format: :auto, quality: :auto
    elsif media[:video]
      media_video_tag media[:video], alt: media[:alt], largeur: media.fetch(:largeur, 1200),
                      lecteur: media[:lecteur], muet: media[:muet], attente: media.fetch(:attente, 1),
                      class: "projet-media__el"
    end
  end
end
