# Migration des images locales vers Cloudinary (étape 7).
#
#   bin/rails cloudinary:verifier          appels admin en lecture seule (mode de dossiers, ressources TF1)
#   DRY_RUN=1 bin/rails cloudinary:upload  liste ce qui serait envoyé, sans rien envoyer
#   bin/rails cloudinary:upload            envoie et remplit config/cloudinary_assets.yml
#
# Identifiants : CLOUDINARY_URL (.env), jamais affiché.
# Aucune ressource existante n'est écrasée (overwrite: false).

module CloudinaryMigration
  RACINE = "rails-folio"

  # chemin dans app/assets/images => public_id cible
  PLAN = {
    "tf1/lou.png"                          => "projets/tf1/lou",

    "shelfie/logoshelfie.jpg"              => "projets/shelfie/logo",
    "shelfie/3840154.jpg"                  => "projets/shelfie/charte",
    "shelfie/3840154-2.jpg"                => "projets/shelfie/charte-2",
    "shelfie/3981779.jpg"                  => "projets/shelfie/ecrans",

    "macval/bandeau web noir.jpg"          => "projets/macval/bandeau-web-noir",
    "macval/logo.gif"                      => "projets/macval/logo-anime",
    "macval/expo-affiche-1.jpg"            => "projets/macval/affiche-1",
    "macval/expo-affiche-2.jpg"            => "projets/macval/affiche-2",
    "macval/Branding_Mockup_2.jpg"         => "projets/macval/papeterie",
    "macval/magnet.jpg"                    => "projets/macval/badges",
    "macval/MU-a-entree-2.jpg"             => "projets/macval/signaletique-entree",
    "macval/MU-CENTRE-DE-DOC-2.jpg"        => "projets/macval/signaletique-centre-doc",

    "slides/slide_branding_31.jpg"         => "projets/slides/affiche-deroulee",
    "slides/slide_branding_1.jpg"          => "projets/slides/serie-affiches",
    "slides/slide_branding_2.jpg"          => "projets/slides/papeterie",
    "slides/billet-evenement_134533-5.jpg" => "projets/slides/billets",
    "slides/catalogue.gif"                 => "projets/slides/catalogue-anime",
    "slides/urban_poster_mockup.jpg"       => "projets/slides/affiches-rue",
    "slides/sceno.gif"                     => "projets/slides/scenographie-animee",
    "slides/totebag2.jpg"                  => "projets/slides/totebag",
    "slides/MU 1.jpg"                      => "projets/slides/totebag-noir",

    "mango/logomango2.gif"                 => "projets/mango/logo-anime",
    "mango/carte.jpg"                      => "projets/mango/cartes",
    "mango/livre-1.jpg"                    => "projets/mango/livre",
    "mango/livre-2.jpg"                    => "projets/mango/livres-cuisine",
    "mango/tote.jpg"                       => "projets/mango/totebag",

    "lacolline/banniere.jpg"               => "projets/la-colline/banniere",
    "lacolline/Glass_Oil_Bottle_2.jpg"     => "projets/la-colline/bouteilles",
    "lacolline/mobile2.jpg"                => "projets/la-colline/declinaisons",
    "lacolline/laptop1.jpg"                => "projets/la-colline/site",

    "ford/MU_Couv_Ford.jpg"                => "projets/ford/couverture",
    "ford/Mockup_Ford.jpg"                 => "projets/ford/doubles-pages",
    "ford_couv.jpg"                        => "projets/ford/couverture-typo",

    "abc/livre.jpg"                        => "projets/abecedaire/couverture",
    "abskate_couv.jpg"                     => "projets/abecedaire/couverture-typo",
    "abc/mu-double2.jpg"                   => "projets/abecedaire/double-page-p",
    "abc/mu-double.jpg"                    => "projets/abecedaire/double-page-m",
    "abc/abc.jpg"                          => "projets/abecedaire/lettres",
    "abc/mu-page.jpg"                      => "projets/abecedaire/pages",

    "bio_image.png"                        => "site/portrait-bio"
  }.transform_values { |id| "#{RACINE}/#{id}" }.freeze

  MANIFESTE = Rails.root.join("config/cloudinary_assets.yml")
  IMAGES    = Rails.root.join("app/assets/images")

  def self.manifeste
    (YAML.load_file(MANIFESTE) if MANIFESTE.exist?) || {}
  end

  def self.ecrire_manifeste(donnees)
    entete = "# Généré par bin/rails cloudinary:upload — chemin local => ressource Cloudinary.\n" \
             "# Lu par MediasHelper : un chemin absent est servi en local.\n"
    MANIFESTE.write(entete + donnees.sort.to_h.to_yaml.delete_prefix("---\n"))
  end

  def self.mode_dossiers
    Cloudinary::Api.config(settings: true).dig("settings", "folder_mode")
  end
end

namespace :cloudinary do
  desc "Appels admin en lecture seule : mode de dossiers et ressources TF1"
  task verifier: :environment do
    puts "Mode de dossiers : #{CloudinaryMigration.mode_dossiers || 'inconnu'}"

    { "teaser_nfmktr" => :video, "JEU_ECHEC_myvor0" => :video, "JEU_MOTS_CROISEES_f5me6a" => :video,
      "PERSO_BALLON_y1jedw" => :video, "tf1mu_rgu01t" => :image }.each do |id, type|
      r = Cloudinary::Api.resource(id, resource_type: type)
      taille = r["width"] ? "#{r['width']}×#{r['height']}" : "?"
      duree = r["duration"] ? format(", %.1f s", r["duration"]) : ""
      puts "  existe   #{id} (#{type}, #{r['format']}, #{taille}#{duree}, #{(r['bytes'] / 1e6).round(2)} Mo)"
    rescue Cloudinary::Api::NotFound
      puts "  ABSENT   #{id} (#{type})"
    end

    deja_pris = CloudinaryMigration::PLAN.values.select do |id|
      Cloudinary::Api.resource(id) && true
    rescue Cloudinary::Api::NotFound
      false
    end
    puts "public_id cibles déjà pris sur le compte : #{deja_pris.empty? ? 'aucun' : deja_pris.join(', ')}"
  end

  desc "Envoie les images du plan (DRY_RUN=1 pour lister sans envoyer)"
  task upload: :environment do
    essai = ENV["DRY_RUN"].present?
    manifeste = CloudinaryMigration.manifeste
    dynamique = !essai && CloudinaryMigration.mode_dossiers == "dynamic"
    total = 0

    puts essai ? "ESSAI : rien n'est envoyé.\n\n" : "Envoi vers Cloudinary\n\n"

    CloudinaryMigration::PLAN.each do |chemin, public_id|
      fichier = CloudinaryMigration::IMAGES.join(chemin)
      raise "Fichier introuvable : #{chemin}" unless fichier.exist?

      octets = fichier.size
      total += octets
      ligne = format("%6.2f Mo  %-38s → %s", octets / 1e6, chemin, public_id)

      if manifeste.key?(chemin)
        puts "déjà fait  #{ligne}"
        next
      end
      if essai
        puts "à envoyer  #{ligne}"
        next
      end

      options = { public_id: public_id, resource_type: :image, overwrite: false,
                  use_filename: false, unique_filename: false }
      options[:asset_folder] = File.dirname(public_id) if dynamique
      r = Cloudinary::Uploader.upload(fichier.to_s, options)

      if r["existing"]
        puts "EXISTANT   #{ligne} (non écrasé, non enregistré)"
        next
      end

      manifeste[chemin] = { "public_id" => r["public_id"], "format" => r["format"],
                            "width" => r["width"], "height" => r["height"] }
      CloudinaryMigration.ecrire_manifeste(manifeste) # écrit à chaque envoi : reprise possible
      puts "envoyé     #{ligne}"
    end

    puts format("\n%d fichiers, %.1f Mo au total.", CloudinaryMigration::PLAN.size, total / 1e6)
  end
end
