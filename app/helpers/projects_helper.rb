module ProjectsHelper
  # Liste des projets, dans l'ordre de la home.
  # images : aperçu au survol de la home (1 ou 2).
  PROJETS = [
    { slug: "tf1", nom: "TF1 — E-learning", tags: %w[motion UI],
      images: %w[tf1/lou.png],
      contexte: "Agence Tremplin Numérique",
      role: "Motion design typographique sous After Effects, compositing et intégration des animations de personnages (réalisées par un collègue), mise en page de l'interface du module" },
    { slug: "shelfie", nom: "Shelfie", tags: %w[UI dev],
      images: %w[shelfie/3840154.jpg],
      contexte: "Projet d'équipe, Le Wagon",
      role: "Direction artistique et développement front" },
    { slug: "macval", nom: "MAC VAL", tags: %w[identité motion],
      images: %w[macval/Branding_Mockup_2.jpg macval/magnet.jpg],
      contexte: "Proposition d'identité",
      role: "Conception complète : direction artistique, création et déclinaisons" },
    { slug: "slides", nom: "Slides", tags: %w[identité motion],
      images: ["slides/slide_branding_31.jpg", "slides/MU 1.jpg"],
      contexte: "Projet de diplôme",
      role: "Conception complète : identité, affiches, scénographie" },
    { slug: "mango", nom: "Mango Édition", tags: %w[identité motion],
      images: %w[mango/livre-2.jpg mango/tote.jpg],
      contexte: "Proposition d'identité",
      role: "Conception complète : direction artistique, création et déclinaisons" },
    { slug: "la_colline", nom: "La Colline", tags: %w[packaging illustration],
      images: %w[lacolline/Glass_Oil_Bottle_2.jpg lacolline/mobile2.jpg],
      contexte: "Client",
      role: "Conception complète : direction artistique, illustration, packaging" },
    { slug: "ford", nom: "Ford", tags: %w[édition],
      images: %w[ford/Mockup_Ford.jpg],
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
  #   { video: "public_id", controls: true }       vidéo Cloudinary (boucle muette sinon)
  def projet_media(media)
    if media[:image]
      image_tag media[:image], alt: media[:alt], loading: "lazy", decoding: "async",
                width: media[:width], height: media[:height], class: "projet-media__el"
    elsif media[:cl_image]
      cl_image_tag media[:cl_image], alt: media[:alt], loading: "lazy", class: "projet-media__el",
                   transform: { fetch_format: :auto, quality: :auto }
    elsif media[:video]
      lecture = media[:controls] ? { controls: true } : { autoplay: true, loop: true }
      cl_video_tag media[:video], muted: true, playsinline: true, preload: "metadata",
                   class: "projet-media__el", "aria-label": media[:alt],
                   transform: { fetch_format: :auto, quality: :auto }, **lecture
    end
  end
end
