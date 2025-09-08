class ContactsController < ApplicationController
  def create
    cp = params.require(:contact).permit(:name, :email, :country_code, :phone, :message)
    ContactMailer
      .contact_email(cp[:name], cp[:email], cp[:message])
      .deliver_now

    redirect_to contact_path, notice: "Merci pour votre message !"
  end
end
