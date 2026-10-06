# Migration des images locales vers Cloudinary (étape 7).
#
#   bin/rails cloudinary:verifier          appels admin en lecture seule (mode de dossiers, ressources TF1)
#   DRY_RUN=1 bin/rails cloudinary:upload  liste ce qui serait envoyé, sans rien envoyer
#   bin/rails cloudinary:upload            envoie et remplit config/cloudinary_assets.yml
#   DRY_RUN=1 bin/rails cloudinary:import_projets   nouveaux projets : liste les exports de tmp/import/
#   bin/rails cloudinary:import_projets            les envoie et complète le manifeste
#
# Identifiants : CLOUDINARY_URL (.env), jamais affiché.
# Aucune ressource existante n'est écrasée (overwrite: false).

module CloudinaryMigration
  RACINE = "portfolio"

  # chemin dans app/assets/images => public_id cible
  PLAN = {
    "tf1/lou.png"                          => "tf1/lou",

    "shelfie/logoshelfie.jpg"              => "shelfie/logo",
    "shelfie/3840154.jpg"                  => "shelfie/charte",
    "shelfie/3840154-2.jpg"                => "shelfie/charte-2",
    "shelfie/3981779.jpg"                  => "shelfie/ecrans",

    "macval/bandeau web noir.jpg"          => "macval/bandeau-web-noir",
    "macval/logo.gif"                      => "macval/logo-anime",
    "macval/expo-affiche-1.jpg"            => "macval/affiche-1",
    "macval/expo-affiche-2.jpg"            => "macval/affiche-2",
    "macval/Branding_Mockup_2.jpg"         => "macval/papeterie",
    "macval/magnet.jpg"                    => "macval/badges",
    "macval/MU-a-entree-2.jpg"             => "macval/signaletique-entree",
    "macval/MU-CENTRE-DE-DOC-2.jpg"        => "macval/signaletique-centre-doc",

    "slides/slide_branding_31.jpg"         => "slides/affiche-deroulee",
    "slides/slide_branding_1.jpg"          => "slides/serie-affiches",
    "slides/slide_branding_2.jpg"          => "slides/papeterie",
    "slides/billet-evenement_134533-5.jpg" => "slides/billets",
    "slides/catalogue.gif"                 => "slides/catalogue-anime",
    "slides/urban_poster_mockup.jpg"       => "slides/affiches-rue",
    "slides/sceno.gif"                     => "slides/scenographie-animee",
    "slides/totebag2.jpg"                  => "slides/totebag",
    "slides/MU 1.jpg"                      => "slides/totebag-noir",

    "mango/logomango2.gif"                 => "mango/logo-anime",
    "mango/carte.jpg"                      => "mango/cartes",
    "mango/livre-1.jpg"                    => "mango/livre",
    "mango/livre-2.jpg"                    => "mango/livres-cuisine",
    "mango/tote.jpg"                       => "mango/totebag",

    "lacolline/banniere.jpg"               => "la-colline/banniere",
    "lacolline/Glass_Oil_Bottle_2.jpg"     => "la-colline/bouteilles",
    "lacolline/mobile2.jpg"                => "la-colline/declinaisons",
    "lacolline/laptop1.jpg"                => "la-colline/site",

    "ford/MU_Couv_Ford.jpg"                => "ford/couverture",
    "ford/Mockup_Ford.jpg"                 => "ford/doubles-pages",
    "ford_couv.jpg"                        => "ford/couverture-typo",

    "abc/livre.jpg"                        => "abecedaire/couverture",
    "abskate_couv.jpg"                     => "abecedaire/couverture-typo",
    "abc/mu-double2.jpg"                   => "abecedaire/double-page-p",
    "abc/mu-double.jpg"                    => "abecedaire/double-page-m",
    "abc/abc.jpg"                          => "abecedaire/lettres",
    "abc/mu-page.jpg"                      => "abecedaire/pages",

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

  # L'API config ne renvoie pas le mode pour ce compte : en mode « dynamic »,
  # les ressources portent un champ asset_folder.
  def self.mode_dossiers
    ressource = Cloudinary::Api.resources(max_results: 1)["resources"].first
    return nil unless ressource
    ressource.key?("asset_folder") ? "dynamic" : "fixed"
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

  # Nouveaux projets : même méthode que l'étape 7, à partir des exports de tmp/import/<dossier>/.
  # Fichier « 04-ia-dans-la-ville.png » → clé « <slug>/ia-dans-la-ville.png » du manifeste,
  # public_id « portfolio/<slug>/ia-dans-la-ville ». Un fichier absent est simplement ignoré.
  desc "Envoie les images de tmp/import/ des nouveaux projets (DRY_RUN=1 pour lister sans envoyer)"
  task import_projets: :environment do
    dossiers = { "mgp" => "metropole-grand-paris", "beach-bikes" => "beach-bikes", "reli-art" => "atelier-reli-art" }
    essai = ENV["DRY_RUN"].present?
    manifeste = CloudinaryMigration.manifeste
    dynamique = !essai && CloudinaryMigration.mode_dossiers == "dynamic"
    racine = Rails.root.join("tmp/import")

    puts essai ? "ESSAI : rien n'est envoyé.\n\n" : "Envoi vers Cloudinary\n\n"
    dossiers.each do |dossier, slug|
      fichiers = Dir.glob(racine.join(dossier, "*.{png,jpg,jpeg,PNG,JPG,JPEG}")).sort
      puts "#{dossier}/ : #{fichiers.empty? ? 'aucun fichier' : "#{fichiers.size} fichier(s)"}"
      fichiers.each do |fichier|
        nom = File.basename(fichier, ".*").sub(/\A\d+[-_ ]*/, "").parameterize
        chemin = "#{slug}/#{nom}#{File.extname(fichier).downcase}"
        public_id = "#{CloudinaryMigration::RACINE}/#{slug}/#{nom}"
        ligne = format("%6.2f Mo  %-40s → %s", File.size(fichier) / 1e6, File.basename(fichier), public_id)

        if manifeste.key?(chemin)
          puts "  déjà fait  #{ligne}"
          next
        end
        if essai
          puts "  à envoyer  #{ligne}"
          next
        end

        options = { public_id: public_id, resource_type: :image, overwrite: false,
                    use_filename: false, unique_filename: false }
        options[:asset_folder] = File.dirname(public_id) if dynamique
        r = Cloudinary::Uploader.upload(fichier, options)
        if r["existing"]
          puts "  EXISTANT   #{ligne} (non écrasé, non enregistré)"
          next
        end

        manifeste[chemin] = { "public_id" => r["public_id"], "format" => r["format"],
                              "width" => r["width"], "height" => r["height"] }
        CloudinaryMigration.ecrire_manifeste(manifeste)
        puts "  envoyé     #{ligne}"
      end
    end
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
