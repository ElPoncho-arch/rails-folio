module ProjectsHelper
  # Liste des projets, dans l'ordre de la home.
  # images : aperçu au survol de la home (1 ou 2) ; { video:, seconde: } = image fixe tirée d'une vidéo.
  PROJETS = [
    { slug: "tf1", nom: "TF1 — E-learning", tags: %w[motion UI],
      images: ["tf1/lou.png", { video: "teaser_nfmktr", seconde: 2 }],
      contexte: "Agence Tremplin Numérique",
      role: "Motion design typographique sous After Effects, compositing et intégration des animations de personnages (réalisées par un collègue), mise en page de l’interface du module" },
    { slug: "shelfie", nom: "Shelfie", tags: %w[UI dev],
      images: %w[shelfie/3840154.jpg],
      contexte: "Projet d’équipe, Le Wagon",
      role: "Direction artistique et développement front" },
    { slug: "macval", nom: "MAC VAL", tags: %w[identité motion],
      images: %w[macval/Branding_Mockup_2.jpg macval/magnet.jpg],
      contexte: "Proposition d’identité",
      role: "Conception complète : direction artistique, création et déclinaisons" },
    { slug: "slides", nom: "Slides", tags: %w[identité motion],
      images: ["slides/slide_branding_31.jpg", "slides/MU 1.jpg"],
      contexte: "Projet de diplôme",
      role: "Conception complète : identité, affiches, scénographie" },
    { slug: "mango", nom: "Mango Édition", tags: %w[identité motion],
      images: %w[mango/livre-2.jpg mango/tote.jpg],
      contexte: "Proposition d’identité",
      role: "Conception complète : direction artistique, création et déclinaisons" },
    { slug: "la_colline", nom: "La Colline", tags: %w[packaging illustration],
      images: %w[lacolline/Glass_Oil_Bottle_2.jpg lacolline/mobile2.jpg],
      contexte: "Client",
      role: "Conception complète : direction artistique, illustration, packaging" },
    { slug: "ford", nom: "Ford", tags: %w[édition],
      images: %w[ford/Mockup_Ford.jpg ford_couv.jpg],
      contexte: "Projet éditorial",
      role: "Conception complète : direction artistique, mise en page" },
    { slug: "abskate", nom: "Abécédaire", tags: %w[édition],
      images: %w[abc/livre.jpg abskate_couv.jpg],
      contexte: "Projet éditorial",
      role: "Conception complète : direction artistique, mise en page" }
  ].freeze

  def projets
    PROJETS
  end

  def projet_path_for(projet)
    "/projects/#{projet[:slug]}"
  end

  # Projet de la page en cours (une action = un projet)
  def projet_courant
    @projet_courant ||= PROJETS.find { |p| p[:slug] == action_name }
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
