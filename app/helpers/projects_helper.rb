module ProjectsHelper
  # Liste des projets, dans l'ordre de la home (et de la navigation précédent / suivant) :
  # projets récents d'abord, projets d'école (Shelfie, Slides) en dernier.
  # images : image de la card sur la home (la première disponible) ; { video:, seconde: } = image fixe
  # tirée d'une vidéo ; logo: true = logo sur fond uni affiché en entier dans le cadre carré de la card
  # (marge de la couleur du bord ; à éviter sur un fond texturé, la marge s'y verrait) ;
  # marge: 10 = logo en retrait de 10 % de chaque côté.
  PROJETS = [
    { slug: "metropole-grand-paris", nom: "Métropole du Grand Paris", tags: %w[identité],
      etiquettes: ["PVV / Tremplin Numérique", "Identité visuelle"],
      images: [{ image: "metropole-grand-paris/logo.webp", logo: true, marge: 10 }, "metropole-grand-paris/agoras-salle.png"],
      client: "Métropole du Grand Paris, via PVV et Bluenove",
      role: "Responsable du pôle graphisme",
      outils: "Illustrator · InDesign · Photoshop · After Effects · Premiere Pro" },
    { slug: "beach-bikes", nom: "Beach Bikes Arcachon", tags: %w[UI dev],
      etiquettes: ["Freelance", "Interface B2B", "Mission en cours"],
      images: %w[beach-bikes/logo.jpg beach-bikes/reservations.png],
      client: "Beach Bikes Arcachon",
      role: "UI et développement",
      outils: "Figma · Ruby on Rails · Stimulus · SQL" },
    { slug: "atelier-reli-art", nom: "Atelier Reli’Art", tags: %w[identité],
      etiquettes: ["Freelance", "Identité visuelle"],
      images: [{ image: "atelier-reli-art/logo.png", logo: true, marge: 8 }, "atelier-reli-art/proposition-1.png"],
      client: "Atelier Reli’Art",
      role: "Direction artistique",
      outils: "Illustrator · Photoshop" },
    { slug: "tf1", nom: "TF1 — E-learning", tags: %w[motion UI],
      images: ["tf1/lou.png", { video: "teaser_nfmktr", seconde: 2 }],
      etiquettes: ["Tremplin Numérique", "Module e-learning"],
      client: "Groupe TF1, via Tremplin Numérique",
      role: "Motion et UI",
      outils: "After Effects · Illustrator · Figma" },
    { slug: "la_colline", nom: "La Colline", tags: %w[packaging illustration],
      images: %w[lacolline/Glass_Oil_Bottle_2.jpg lacolline/mobile2.jpg],
      etiquettes: ["Freelance", "Identité, packaging & web"],
      client: "La Colline",
      role: "Direction artistique et UI",
      outils: "Illustrator · Figma · WordPress · Elementor" },
    { slug: "macval", nom: "MAC VAL", tags: %w[identité motion],
      images: %w[macval/Branding_Mockup_2.jpg macval/magnet.jpg],
      etiquettes: ["Proposition d’identité"],
      client: "Projet d’école",
      role: "Direction artistique et motion",
      outils: "Illustrator · InDesign · Photoshop" },
    { slug: "mango", nom: "Mango Édition", tags: %w[identité motion],
      images: %w[mango/livre-2.jpg mango/tote.jpg],
      etiquettes: ["Proposition d’identité"],
      client: "Projet d’école",
      role: "Direction artistique et motion",
      outils: "Illustrator · InDesign · Photoshop · After Effects" },
    { slug: "ford", nom: "Ford", tags: %w[édition],
      images: %w[ford/Mockup_Ford.jpg ford_couv.jpg],
      etiquettes: ["Proposition éditoriale", "Brochure"],
      client: "Proposition non commandée",
      role: "Graphisme et mise en page",
      outils: "Illustrator · InDesign · Photoshop" },
    { slug: "abskate", nom: "Abécédaire", tags: %w[édition],
      images: %w[abc/livre.jpg abskate_couv.jpg],
      etiquettes: ["Collaboration", "Projet éditorial"],
      client: "Collaboration pour un événement skate",
      role: "Graphisme et mise en page",
      outils: "Illustrator · InDesign · Photoshop" },
    { slug: "shelfie", nom: "Shelfie", tags: %w[UI dev],
      images: %w[shelfie/logoshelfie.jpg shelfie/3840154.jpg],
      etiquettes: ["Application mobile"],
      client: "Bootcamp Le Wagon · Projet d’équipe",
      role: "Direction artistique et front",
      outils: "Figma · Ruby on Rails · Stimulus · JavaScript · HTML · CSS" },
    { slug: "slides", nom: "Slides", tags: %w[identité motion],
      images: [{ video: "slides_logo_anim_meykfx", seconde: 1.35 }, # dernière image du logo animé (1,4 s)
               "slides/slide_branding_31.jpg", "slides/MU 1.jpg"],
      etiquettes: ["Identité & scénographie"],
      client: "Projet de diplôme",
      role: "Direction artistique et motion",
      outils: "Illustrator · InDesign · Photoshop · After Effects" }
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

  # URL de l'image de la card du projet sur la home : première image disponible, sinon rien.
  # Un logo tient en entier dans le cadre carré de la card (voir .projet-card__image dans _home.scss).
  def projet_apercu_url(projet)
    image = projet[:images].find { |i| media_disponible?(i) }
    return unless image

    cadre = "1:1" if image.is_a?(Hash) && image[:logo]
    marge = image.is_a?(Hash) ? image[:marge].to_i : 0
    image = image[:image] if image.is_a?(Hash) && image[:image]
    media_image_url(image, largeur: 800, cadre: cadre, marge: marge)
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
