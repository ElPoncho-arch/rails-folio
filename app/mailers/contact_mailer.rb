class ContactMailer < ApplicationMailer
  default to: "hoarauf4@gmail.com"

  def contact_email(name, email, message)
    @name    = name
    @message = message
    @email   = email
    mail(
      subject: "Nouveau message depuis ton portfolio",
      reply_to: email
    )
  end
end
