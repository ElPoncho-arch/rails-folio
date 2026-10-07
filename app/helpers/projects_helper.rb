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
      contexte: "Agence Tremplin Numérique",
      role: "Motion design typographique sous After Effects, compositing et intégration des animations de personnages (réalisées par un collègue), mise en page de l’interface du module" },
    { slug: "la_colline", nom: "La Colline", tags: %w[packaging illustration],
      images: %w[lacolline/Glass_Oil_Bottle_2.jpg lacolline/mobile2.jpg],
      contexte: "Client",
      role: "Conception complète : direction artistique, illustration, packaging" },
    { slug: "macval", nom: "MAC VAL", tags: %w[identité motion],
      images: %w[macval/Branding_Mockup_2.jpg macval/magnet.jpg],
      contexte: "Proposition d’identité",
      role: "Conception complète : direction artistique, création et déclinaisons" },
    { slug: "mango", nom: "Mango Édition", tags: %w[identité motion],
      images: %w[mango/livre-2.jpg mango/tote.jpg],
      contexte: "Proposition d’identité",
      role: "Conception complète : direction artistique, création et déclinaisons" },
    { slug: "ford", nom: "Ford", tags: %w[édition],
      images: %w[ford/Mockup_Ford.jpg ford_couv.jpg],
      contexte: "Projet éditorial",
      role: "Conception complète : direction artistique, mise en page" },
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

  # Bloc de médias tolérant aux absents : 2 disponibles → paire, 1 → pleine largeur, 0 → rien
  def projet_bloc_medias(*medias, ratio: nil)
    presents = medias.select { |m| media_disponible?(m) }
    case presents.size
    when 0 then nil
    when 1 then render("projects/media_pleine", media: presents.first, ratio: ratio)
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
