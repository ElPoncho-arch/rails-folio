class ContactsController < ApplicationController
  def create
    @contact = Contact.new(contact_params)

    unless @contact.valid?
      render "pages/contact", status: :unprocessable_entity
      return
    end

    ContactMailer.contact_email(@contact.name, @contact.email, @contact.message).deliver_later
    redirect_to contact_path, status: :see_other,
                notice: "Merci, votre message est bien parti ! Je vous réponds rapidement."
  rescue StandardError => e
    Rails.logger.error "ContactMailer failed: #{e.message}"
    redirect_to contact_path, status: :see_other,
                alert: "L’envoi a échoué. Réessayez, ou écrivez-moi directement à hoarauf4@gmail.com."
  end

  private

  def contact_params
    params.require(:contact).permit(:name, :email, :message)
  end
end
