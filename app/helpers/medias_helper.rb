# Images servies par Cloudinary si elles figurent dans config/cloudinary_assets.yml
# (rempli par bin/rails cloudinary:upload), sinon depuis app/assets/images.
module MediasHelper
  LARGEURS = [640, 1024, 1600, 2400].freeze
  MANIFESTE = Rails.root.join("config/cloudinary_assets.yml")

  # URL d'une image à une largeur maximale donnée (jamais agrandie).
  # chemin : chemin local, ou { video: "public_id", seconde: 2 } pour une image fixe tirée d'une vidéo.
  def media_image_url(chemin, largeur:)
    return media_video_image_url(chemin[:video], seconde: chemin[:seconde], largeur: largeur) if chemin.is_a?(Hash)

    media = media_cloudinary(chemin)
    return asset_path(chemin) unless media

    cloudinary_url media["public_id"], secure: true,
                   transformation: [{ width: largeur, crop: :limit }, { fetch_format: :auto }, { quality: :auto }]
  end

  # <img> avec srcset si l'image est sur Cloudinary ; sizes décrit la largeur affichée
  def media_image_tag(chemin, alt:, sizes:, **html)
    media = media_cloudinary(chemin)
    options = { alt: alt, loading: "lazy", decoding: "async" }.merge(html)
    return image_tag(chemin, **options) unless media

    largeur = media["width"]
    largeurs = (LARGEURS.select { |l| l < largeur } + [[largeur, LARGEURS.last].min]).uniq
    tag.img src: media_image_url(chemin, largeur: [1024, largeur].min),
            srcset: largeurs.map { |l| "#{media_image_url(chemin, largeur: l)} #{l}w" }.join(", "),
            sizes: sizes, width: largeur, height: media["height"], **options.except(:width, :height)
  end

  # GIF animé sur Cloudinary servi en vidéo muette en boucle (f_auto:video),
  # avec la 1re image en attente (pg_1). Hors Cloudinary : le GIF tel quel.
  def media_gif_tag(chemin, alt:, largeur: 1080, **html)
    media = media_cloudinary(chemin)
    return media_image_tag(chemin, alt: alt, sizes: "100vw", **html) unless media && media["format"] == "gif"

    media_gif_video_tag media["public_id"], alt: alt, largeur: largeur,
                        width: media["width"], height: media["height"], **html.except(:width, :height, :sizes)
  end

  # GIF animé déjà sur Cloudinary (public_id) servi en vidéo muette en boucle,
  # pilotée comme les autres boucles par video_boucle_controller.js
  # (bouton lecture / pause, pause hors écran, arrêt en mouvement réduit — WCAG 2.2.2)
  def media_gif_video_tag(public_id, alt:, largeur:, **html)
    cadre = { width: largeur, crop: :limit }
    video = cloudinary_url public_id, secure: true,
                           transformation: [cadre, { fetch_format: "auto:video" }, { quality: :auto }, { audio_codec: "none" }]
    attente = cloudinary_url public_id, secure: true,
                             transformation: [cadre, { page: 1 }, { fetch_format: :auto }, { quality: :auto }]

    tag.video tag.source(src: video), poster: attente, autoplay: true, muted: true, loop: true,
              playsinline: true, preload: "metadata", "aria-label": alt,
              data: { controller: "video-boucle" }, **html
  end

  # Vidéo Cloudinary (public_id existant, inchangé) :
  #   boucle muette (par défaut) : autoplay, muted, loop, ac_none, preload metadata,
  #                                pilotée par video_boucle_controller.js (bouton, pause hors écran)
  #   lecteur (lecteur: true)    : controls, preload none, ne se charge qu'au clic
  # L'image d'attente est tirée de la vidéo à la seconde « attente ».
  def media_video_tag(public_id, alt:, largeur:, lecteur: false, attente: 1, **html)
    cadre = { width: largeur, crop: :limit }
    son = lecteur ? [] : [{ audio_codec: "none" }]
    video = cloudinary_url public_id, secure: true, resource_type: :video,
                           transformation: [cadre, { fetch_format: "auto:video" }, { quality: :auto }, *son]
    lecture = if lecteur
                { controls: true, preload: "none" }
              else
                { autoplay: true, muted: true, loop: true, preload: "metadata", data: { controller: "video-boucle" } }
              end

    tag.video tag.source(src: video), poster: media_video_image_url(public_id, seconde: attente, largeur: largeur),
              playsinline: true, "aria-label": alt, **lecture, **html
  end

  def media_video_image_url(public_id, seconde:, largeur:)
    cloudinary_url public_id, secure: true, resource_type: :video, format: "jpg",
                   transformation: [{ start_offset: seconde }, { width: largeur, crop: :limit },
                                    { fetch_format: :auto }, { quality: :auto }]
  end

  def media_cloudinary(chemin)
    MediasHelper.manifeste[chemin]
  end

  # Relu seulement quand le fichier change
  def self.manifeste
    mtime = MANIFESTE.exist? ? MANIFESTE.mtime : nil
    if mtime != @mtime
      @mtime = mtime
      @manifeste = (YAML.load_file(MANIFESTE) if mtime) || {}
    end
    @manifeste
  end
end
