class ContactsController < ApplicationController
  def create
    cp = params.require(:contact).permit(:name, :email, :country_code, :phone, :message)
    begin
      ContactMailer
        .contact_email(cp[:name], cp[:email], cp[:message])
        .deliver_later
      redirect_to contact_path, notice: "Merci pour votre message !"
    rescue => e
      Rails.logger.error "ContactMailer failed: #{e.message}"
      redirect_to contact_path, alert: "Une erreur est survenue, veuillez réessayer."
    end
  end
end
