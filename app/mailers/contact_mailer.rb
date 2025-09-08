class ContactMailer < ApplicationMailer
  default to: "hoarauf4@gmail.com"

  def contact_email(name, email, message)
    @name         = name
    @message      = message
    @sender_email = email

    mail(
      from:     email,
      subject:  "Nouveau message depuis ton portfolio",
      reply_to: email
    )
  end
end
