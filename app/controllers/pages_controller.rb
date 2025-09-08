class PagesController < ApplicationController
  def contact
    @contact = OpenStruct.new   # ou ton modèle Contact si tu l’as créé
  end

  def create_contact
    @contact = Contact.new(contact_params)
    if @contact.valid?
      # ex. envoi d'email ou webhook Slack
      redirect_to contact_path, notice: "Merci, votre message a été envoyé !"
    else
      render :contact, status: :unprocessable_entity
    end
  end

  private

  def contact_params
    params.require(:contact).permit(:name, :email, :country_code, :phone, :message)
  end
end
