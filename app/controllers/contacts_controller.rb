class ContactsController < ApplicationController
  # Limite d'envois : 5 messages par adresse IP et par heure (Rails 7.1 n'a pas encore rate_limit).
  # Compteur en mémoire du processus, indépendant du cache de l'appli (actif aussi en développement).
  ENVOIS_MAX = 5
  ENVOIS_FENETRE = 1.hour
  ENVOIS = ActiveSupport::Cache::MemoryStore.new(size: 1.megabyte)

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

    if trop_d_envois?
      redirect_to profil_path(anchor: "contact"), status: :see_other,
                  alert: "Trop de messages envoyés en peu de temps. Réessayez dans une heure, ou écrivez-moi directement à hoarauf4@gmail.com."
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

  # Compte l'envoi en cours ; vrai au-delà de ENVOIS_MAX dans la fenêtre (qui démarre au 1er envoi)
  def trop_d_envois?
    cle = "contact:#{request.remote_ip}"
    ENVOIS.write(cle, 0, expires_in: ENVOIS_FENETRE, unless_exist: true)
    ENVOIS.increment(cle).to_i > ENVOIS_MAX
  end

  def contact_params
    params.require(:contact).permit(:name, :email, :message, :site_web)
  end
end
