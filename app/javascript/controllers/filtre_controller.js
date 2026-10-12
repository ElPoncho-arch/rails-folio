import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Filtre des projets de la home par tag. Posé sur la section #projets.
// Menu déroulant : le bouton « filtrer » ouvre un panneau flottant de pilules (une par tag).
// Fermé, le bouton affiche le tag actif, et la croix à côté réaffiche tout.
// Choisir un tag filtre la grille et referme le menu ; Échap, un clic ou un focus hors du filtre le referment aussi.
// Un seul tag actif à la fois ; un nouveau clic sur le tag actif (ou sur « tous ») affiche tout.
// Les cards écartées sortent en fondu, puis celles qui restent se replacent en rebond léger.
// Les cards masquées reçoivent l'attribut hidden : ni vues, ni atteignables au clavier.
// Le compteur du titre suit, et le nombre de résultats est annoncé aux lecteurs d'écran.
// Mouvement réduit : tout est immédiat.
export default class extends Controller {
  static targets = ["filtre", "ouvrir", "libelle", "signe", "effacer", "panneau", "bouton", "carte", "compteur", "annonce"]

  connect() {
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    this.tag = null
    this.ouvert = false
    this.ouvrirTarget.hidden = false

    this.reset = () => {
      this.fermer({ anime: false })
      this.appliquer(null, { anime: false, annonce: false })
    }
    document.addEventListener("turbo:before-cache", this.reset)
  }

  disconnect() {
    document.removeEventListener("turbo:before-cache", this.reset)
    this.reset()
  }

  // --- Menu déroulant ---

  basculer() {
    this.ouvert ? this.fermer() : this.ouvrir()
  }

  ouvrir() {
    if (this.ouvert) return
    this.ouvert = true
    this.ouvrirTarget.setAttribute("aria-expanded", "true")
    this.signeTarget.textContent = "−"

    gsap.killTweensOf(this.panneauTarget)
    this.panneauTarget.hidden = false
    if (this.motion.matches) return
    gsap.fromTo(this.panneauTarget,
      { opacity: 0, y: -8, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "back.out(1.4)", clearProps: "transform,opacity" })
  }

  // rendreFocus : le focus revient sur le bouton (Échap, choix d'un tag dont la pilule disparaît avec le panneau)
  fermer({ anime = true, rendreFocus = false } = {}) {
    if (!this.ouvert) return
    this.ouvert = false
    this.ouvrirTarget.setAttribute("aria-expanded", "false")
    this.signeTarget.textContent = "+"
    if (rendreFocus) this.ouvrirTarget.focus()

    gsap.killTweensOf(this.panneauTarget)
    const cacher = () => {
      this.panneauTarget.hidden = true
      gsap.set(this.panneauTarget, { clearProps: "transform,opacity" })
    }
    if (!anime || this.motion.matches) return cacher()
    gsap.to(this.panneauTarget, { opacity: 0, y: -6, scale: 0.98, duration: 0.18, ease: "power2.in", onComplete: cacher })
  }

  echap() {
    if (this.ouvert) this.fermer({ rendreFocus: true })
  }

  clicDehors(event) {
    if (this.ouvert && !this.filtreTarget.contains(event.target)) this.fermer()
  }

  // Tabulation hors du filtre : le menu se referme
  focusDehors(event) {
    if (this.ouvert && event.relatedTarget && !this.filtreTarget.contains(event.relatedTarget)) this.fermer()
  }

  // --- Filtre ---

  choisir(event) {
    const tag = event.currentTarget.dataset.tag || null
    this.appliquer(tag === this.tag ? null : tag)
    this.fermer({ rendreFocus: true })
  }

  effacer() {
    this.appliquer(null)
    this.ouvrirTarget.focus() // la croix disparaît : le focus ne doit pas se perdre
  }

  appliquer(tag, { anime = true, annonce = true } = {}) {
    // Une animation en cours est menée à sa fin avant la suivante
    this.timeline?.progress(1).kill()
    this.timeline = null

    this.tag = tag
    this.boutonTargets.forEach((bouton) => {
      bouton.setAttribute("aria-pressed", String((bouton.dataset.tag || null) === tag))
    })
    this.libelleTarget.textContent = tag || "filtrer"
    this.ouvrirTarget.classList.toggle("filtre__ouvrir--actif", Boolean(tag))
    this.effacerTarget.hidden = !tag
    this.effacerTarget.setAttribute("aria-label", tag ? `Retirer le filtre ${tag}` : "Retirer le filtre")

    const gardees = this.carteTargets.filter((carte) => !tag || carte.dataset.tags.split(" ").includes(tag))
    const sortantes = this.carteTargets.filter((carte) => !carte.hidden && !gardees.includes(carte))

    this.compteurTarget.textContent = String(gardees.length).padStart(2, "0")
    if (annonce) {
      const projets = gardees.length > 1 ? "projets" : "projet"
      this.annonceTarget.textContent = tag ? `${gardees.length} ${projets} en ${tag}` : `${gardees.length} ${projets}`
    }

    const afficher = () => {
      this.carteTargets.forEach((carte) => (carte.hidden = !gardees.includes(carte)))
      ScrollTrigger.refresh() // la grille a changé de hauteur : les apparitions au scroll se recalent
    }

    if (!anime || this.motion.matches) {
      gsap.set(this.carteTargets, { clearProps: "transform,opacity" })
      afficher()
      return
    }

    this.timeline = gsap.timeline({ defaults: { overwrite: "auto" } })
    if (sortantes.length) {
      this.timeline.to(sortantes, { opacity: 0, scale: 0.94, duration: 0.25, ease: "power2.in" })
    }
    this.timeline
      .call(afficher)
      .fromTo(gardees,
        { opacity: 0, y: 16, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.4)", stagger: 0.05, clearProps: "transform,opacity" })
  }
}
