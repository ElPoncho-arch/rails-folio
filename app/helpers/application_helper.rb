module ApplicationHelper
  # Poids d'un fichier en français, sans passer par la locale : « 1,8 Mo », ou « 420 Ko » sous 1 Mo.
  def poids_fichier(chemin)
    octets = File.size(chemin)
    if octets >= 1024 * 1024
      "#{format('%.1f', octets / (1024.0 * 1024)).tr('.', ',')} Mo"
    else
      "#{(octets / 1024.0).round} Ko"
    end
  end
end
