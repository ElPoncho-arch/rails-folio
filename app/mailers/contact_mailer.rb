class ContactMailer < ApplicationMailer
  default to: -> { ENV.fetch("CONTACT_EMAIL", "hoarauf4@gmail.com") }

  def contact_email(name, email, message)
    @name         = name
    @message      = message
    @email        = email

    mail(
      from:     email,
      subject:  "Nouveau message depuis ton portfolio",
      reply_to: email
    )
  end
end
