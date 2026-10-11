class Contact
  include ActiveModel::Model

  # site_web : piège anti-robots, champ invisible que seuls les robots remplissent (voir ContactsController)
  attr_accessor :name, :email, :message, :site_web

  # Longueurs maximales (mêmes valeurs que les maxlength du formulaire, voir pages/profil)
  NOM_MAX = 100
  EMAIL_MAX = 254
  MESSAGE_MAX = 5000

  # Champ vide : aucun texte (message ""), le champ est seulement signalé (contour, aria-invalid)
  validates :name, presence: { message: "" }
  validates :name, length: { maximum: NOM_MAX, message: "Nom trop long (#{NOM_MAX} caractères maximum)." }
  validates :email, presence: { message: "" }
  validates :email, length: { maximum: EMAIL_MAX, message: "Adresse e-mail trop longue." }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, message: "Adresse e-mail invalide (exemple : nom@domaine.fr)." },
                    allow_blank: true
  validates :message, presence: { message: "" }
  validates :message, length: { minimum: 10, message: "Votre message est un peu court (10 caractères minimum)." },
                      allow_blank: true
  validates :message, length: { maximum: MESSAGE_MAX, message: "Votre message est trop long (5 000 caractères maximum)." }

  def robot?
    site_web.present?
  end
end
