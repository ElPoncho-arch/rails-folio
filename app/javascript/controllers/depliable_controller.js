import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Pages projet en mobile (< 768 px) : intro, rôle / durée / outils et blocs repliés derrière
// le bouton « à propos du projet ». Dès 768 px, tout est ouvert et le bouton masqué.
// Fermés, les panneaux sont en hidden="until-found" : cachés aux lecteurs d'écran, mais une ancre
// ou la recherche du navigateur les ouvre (événement beforematch).
// Hauteur animée avec GSAP (jamais visibility) ; instantané en mouvement réduit.
// Après chaque ouverture / fermeture, ScrollTrigger.refresh() : les cartes et reveal en dessous bougent.
export default class extends Controller {
  static targets = ["bouton", "panneau", "signe"]

  connect() {
    this.large = window.matchMedia("(min-width: 768px)")
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)")

    this.onLargeur = () => (this.large.matches ? this.ouvrir(false) : this.fermer(false))
    this.large.addEventListener("change", this.onLargeur)

    this.onTrouve = () => this.ouvrir(false) // ancre ou recherche dans la page : le navigateur a déjà affiché le contenu
    this.onFocus = () => { if (!this.ouvert) this.ouvrir(false) }
    this.panneauTargets.forEach((p) => {
      p.addEventListener("beforematch", this.onTrouve)
      p.addEventListener("focusin", this.onFocus)
    })

    this.boutonTarget.hidden = false
    if (this.large.matches || this.ancreDedans()) this.ouvrir(false)
    else this.fermer(false)
  }

  disconnect() {
    this.large.removeEventListener("change", this.onLargeur)
    this.panneauTargets.forEach((p) => {
      p.removeEventListener("beforematch", this.onTrouve)
      p.removeEventListener("focusin", this.onFocus)
    })
    this.tween?.kill()
  }

  basculer() {
    this.ouvert ? this.fermer() : this.ouvrir()
  }

  ouvrir(anime = true) {
    this.ouvert = true
    this.majBouton()
    this.tween?.kill()
    this.panneauTargets.forEach((p) => p.removeAttribute("hidden"))

    if (!anime || this.motion.matches) {
      gsap.set(this.panneauTargets, { clearProps: "height,overflow" })
      return this.rafraichir()
    }
    this.tween = gsap.fromTo(this.panneauTargets,
      { height: 0, overflow: "hidden" },
      { height: "auto", duration: 0.55, ease: "power3.out", clearProps: "height,overflow", onComplete: () => this.rafraichir() })
  }

  fermer(anime = true) {
    this.ouvert = false
    this.majBouton()
    this.tween?.kill()
    const cacher = () => {
      this.panneauTargets.forEach((p) => p.setAttribute("hidden", "until-found"))
      gsap.set(this.panneauTargets, { clearProps: "height,overflow" })
      this.rafraichir()
    }

    if (!anime || this.motion.matches) return cacher()
    this.tween = gsap.fromTo(this.panneauTargets,
      { height: (i, p) => p.offsetHeight, overflow: "hidden" },
      { height: 0, duration: 0.4, ease: "power2.inOut", onComplete: cacher })
  }

  majBouton() {
    this.boutonTarget.setAttribute("aria-expanded", String(this.ouvert))
    if (this.hasSigneTarget) this.signeTarget.textContent = this.ouvert ? "−" : "+"
  }

  rafraichir() {
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }

  // Arrivée avec une ancre (#…) qui vise un élément d'un panneau
  ancreDedans() {
    const id = decodeURIComponent(window.location.hash.slice(1))
    const cible = id && document.getElementById(id)
    return !!cible && this.panneauTargets.some((p) => p.contains(cible))
  }
}
