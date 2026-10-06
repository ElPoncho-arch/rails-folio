# Images servies par Cloudinary si elles figurent dans config/cloudinary_assets.yml
# (rempli par bin/rails cloudinary:upload), sinon depuis app/assets/images.
module MediasHelper
  LARGEURS = [640, 1024, 1600, 2400].freeze
  MANIFESTE = Rails.root.join("config/cloudinary_assets.yml")

  # URL d'une image à une largeur maximale donnée (jamais agrandie)
  def media_image_url(chemin, largeur:)
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
