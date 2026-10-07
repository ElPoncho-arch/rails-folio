import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Carte média des pages projet (réf. erichuguenin.com) : la carte part à 90 %, ancrée en haut,
// et grandit jusqu'à 100 % une seule fois, quand son haut atteint 75 % de l'écran.
// Posé sur chaque .projet-media__cadre (partials _media_pleine et _media_paire).
// Seul transform est animé : la carte et son bouton vidéo restent atteignables au clavier.
// Mouvement réduit : rien ne bouge.
export default class extends Controller {
  connect() {
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    this.onMotionChange = () => (this.motion.matches ? this.showAll() : null)
    this.motion.addEventListener("change", this.onMotionChange)

    this.reset = this.showAll.bind(this)
    document.addEventListener("turbo:before-cache", this.reset)

    if (!this.motion.matches) this.setup()
  }

  disconnect() {
    this.motion.removeEventListener("change", this.onMotionChange)
    document.removeEventListener("turbo:before-cache", this.reset)
    this.showAll()
  }

  setup() {
    gsap.set(this.element, { scale: 0.9, transformOrigin: "50% 0%" })
    this.trigger = ScrollTrigger.create({
      trigger: this.element,
      start: "top 75%",
      once: true,
      onEnter: () => {
        this.tween = gsap.to(this.element, {
          scale: 1,
          duration: 1.1,
          ease: "back.out(1.1)",
          clearProps: "transform"
        })
      }
    })
  }

  // Carte à sa taille finale, sans animation (mouvement réduit, mise en cache Turbo, départ)
  showAll() {
    this.trigger?.kill()
    this.trigger = null
    this.tween?.kill()
    this.tween = null
    gsap.set(this.element, { clearProps: "transform,transformOrigin" })
  }
}
