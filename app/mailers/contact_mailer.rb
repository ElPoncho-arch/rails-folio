class ContactMailer < ApplicationMailer
  default to: "hoarauf4@gmail.com"

  def contact_email(name, email, message)
    @name    = name
    @message = message
    # on utilise reply_to pour que la réponse aille à l’utilisateur
    mail(subject: "Nouveau message depuis ton portfolio", reply_to: email)
  end
end
