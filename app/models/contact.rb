class Contact
  include ActiveModel::Model

  attr_accessor :name, :email, :message

  validates :name, presence: { message: "Indiquez votre nom." }
  validates :email, presence: { message: "Indiquez votre adresse e-mail." }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, message: "Adresse e-mail invalide (exemple : nom@domaine.fr)." },
                    allow_blank: true
  validates :message, presence: { message: "Écrivez votre message." }
  validates :message, length: { minimum: 10, message: "Votre message est un peu court (10 caractères minimum)." },
                      allow_blank: true
end
