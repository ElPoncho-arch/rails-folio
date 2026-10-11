class Contact
  include ActiveModel::Model

  # site_web : piège anti-robots, champ invisible que seuls les robots remplissent (voir ContactsController)
  attr_accessor :name, :email, :message, :site_web

  # Champ vide : aucun texte (message ""), le champ est seulement signalé (contour, aria-invalid)
  validates :name, presence: { message: "" }
  validates :email, presence: { message: "" }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, message: "Adresse e-mail invalide (exemple : nom@domaine.fr)." },
                    allow_blank: true
  validates :message, presence: { message: "" }
  validates :message, length: { minimum: 10, message: "Votre message est un peu court (10 caractères minimum)." },
                      allow_blank: true

  def robot?
    site_web.present?
  end
end
