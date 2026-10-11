class ContactsController < ApplicationController
  def create
    @contact = Contact.new(contact_params)

    # Piège rempli : robot. Même réponse qu'un envoi réussi, mais aucun mail
    if @contact.robot?
      redirect_to profil_path(anchor: "contact"), status: :see_other,
                  notice: "Merci, votre message est bien parti ! Je vous réponds rapidement."
      return
    end

    unless @contact.valid?
      render "pages/profil", status: :unprocessable_entity
      return
    end

    # Envoi immédiat (pas de file d'attente sur Heroku) : une erreur SMTP est connue tout de suite
    ContactMailer.contact_email(@contact.name, @contact.email, @contact.message).deliver_now
    redirect_to profil_path(anchor: "contact"), status: :see_other,
                notice: "Merci, votre message est bien parti ! Je vous réponds rapidement."
  rescue StandardError => e
    # Classe de l'erreur seulement : le message SMTP peut contenir des adresses
    Rails.logger.error "Envoi du formulaire de contact échoué : #{e.class.name}"
    redirect_to profil_path(anchor: "contact"), status: :see_other,
                alert: "L’envoi a échoué. Réessayez, ou écrivez-moi directement à hoarauf4@gmail.com."
  end

  private

  def contact_params
    params.require(:contact).permit(:name, :email, :message, :site_web)
  end
end
