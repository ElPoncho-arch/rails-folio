import { Controller } from "@hotwired/stimulus"

// Formulaire de contact : vérification à la sortie de chaque champ (blur),
// message d'erreur sous le champ, bouton « Envoi… » pendant l'envoi.
// Sans JS, les attributs required / minlength et la vérification serveur prennent le relais.
const MESSAGES = {
  name:    { valueMissing: "Indiquez votre nom." },
  email:   { valueMissing: "Indiquez votre adresse e-mail.",
             typeMismatch: "Adresse e-mail invalide (exemple : nom@domaine.fr)." },
  message: { valueMissing: "Écrivez votre message.",
             tooShort: "Votre message est un peu court (10 caractères minimum)." }
}

export default class extends Controller {
  static targets = ["champ", "bouton", "statut"]

  connect() {
    this.element.noValidate = true // messages personnalisés à la place des bulles du navigateur
    this.libelle = this.boutonTarget.innerHTML
  }

  // blur : vérifie le champ quitté
  verifier(event) {
    this.valider(event.target)
  }

  // input : une erreur affichée disparaît dès que le champ redevient valide
  corriger(event) {
    const champ = event.target
    if (champ.getAttribute("aria-invalid") === "true") this.valider(champ)
  }

  envoyer(event) {
    const invalides = this.champTargets.filter((champ) => !this.valider(champ))
    if (invalides.length) {
      event.preventDefault()
      invalides[0].focus()
      this.afficherStatut("Vérifiez les champs signalés.", true)
      return
    }
    this.boutonTarget.disabled = true
    this.boutonTarget.setAttribute("aria-busy", "true")
    this.boutonTarget.textContent = "Envoi…"
    this.afficherStatut("", false)
  }

  // turbo:submit-end : en cas d'échec (erreurs serveur, réseau), on rend la main
  fin(event) {
    if (event.detail.success) return
    this.reactiverBouton()
    if (!event.detail.fetchResponse) {
      this.afficherStatut("L’envoi a échoué. Réessayez, ou écrivez-moi directement à hoarauf4@gmail.com.", true)
    } else {
      this.afficherStatut("Vérifiez les champs signalés.", true)
    }
  }

  valider(champ) {
    const nom = champ.name.match(/\[(\w+)\]/)?.[1]
    // Les espaces seuls ne comptent pas comme une saisie
    if (champ.value.trim() === "" && champ.value !== "") champ.value = ""
    const etat = champ.validity
    const cle = ["valueMissing", "typeMismatch", "tooShort"].find((k) => etat[k])
    const erreur = document.getElementById(champ.getAttribute("aria-describedby"))

    if (cle) {
      champ.setAttribute("aria-invalid", "true")
      erreur.textContent = MESSAGES[nom]?.[cle] || champ.validationMessage
      erreur.hidden = false
      return false
    }
    champ.removeAttribute("aria-invalid")
    erreur.textContent = ""
    erreur.hidden = true
    return true
  }

  reactiverBouton() {
    this.boutonTarget.disabled = false
    this.boutonTarget.removeAttribute("aria-busy")
    this.boutonTarget.innerHTML = this.libelle
  }

  afficherStatut(texte, erreur) {
    this.statutTarget.textContent = texte
    this.statutTarget.hidden = texte === ""
    this.statutTarget.classList.toggle("formulaire__statut--erreur", erreur)
  }
}
