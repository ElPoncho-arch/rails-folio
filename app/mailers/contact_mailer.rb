class ContactMailer < ApplicationMailer
  default to: -> { ENV.fetch("CONTACT_EMAIL", "hoarauf4@gmail.com") }

  # Le mail part du compte qui envoie (même adresse que l'authentification SMTP,
  # sinon il risque le spam) ; le visiteur est en reply_to pour lui répondre directement.
  def contact_email(name, email, message)
    @name    = name
    @message = message
    @email   = email

    expediteur = ENV["GMAIL_USERNAME"].presence || ENV.fetch("CONTACT_EMAIL", "hoarauf4@gmail.com")

    mail(
      from:     email_address_with_name(expediteur, "Portfolio — #{name}"),
      reply_to: email,
      subject:  "Nouveau message depuis ton portfolio"
    )
  end
end
