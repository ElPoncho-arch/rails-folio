class PagesController < ApplicationController
  # Profil et contact : présentation, puis formulaire (#contact)
  def profil
    @contact = Contact.new
  end
end
