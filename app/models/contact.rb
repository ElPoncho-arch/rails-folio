class Contact
  include ActiveModel::Model

  attr_accessor :name, :email, :country_code, :phone, :message

  validates :name, :email, :message, presence: true
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP }

  # Optionnel : une simple validation téléphone
  PHONE_REGEX = /\A\+?\d{6,15}\z/
  validates :phone, format: { with: PHONE_REGEX, message: "n'est pas un numéro valide" }, allow_blank: true
end
