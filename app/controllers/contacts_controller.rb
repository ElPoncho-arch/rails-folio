class ContactsController < ApplicationController
  def create
    @contact = Contact.new(contact_params)

    unless @contact.valid?
      render "pages/contact", status: :unprocessable_entity
      return
    end

    # Envoi immédiat (pas de file d'attente sur Heroku) : une erreur SMTP est connue tout de suite
    ContactMailer.contact_email(@contact.name, @contact.email, @contact.message).deliver_now
    redirect_to contact_path, status: :see_other,
                notice: "Merci, votre message est bien parti ! Je vous réponds rapidement."
  rescue StandardError => e
    # Classe de l'erreur seulement : le message SMTP peut contenir des adresses
    Rails.logger.error "Envoi du formulaire de contact échoué : #{e.class.name}"
    redirect_to contact_path, status: :see_other,
                alert: "L’envoi a échoué. Réessayez, ou écrivez-moi directement à hoarauf4@gmail.com."
  end

  private

  def contact_params
    params.require(:contact).permit(:name, :email, :message)
  end
end
