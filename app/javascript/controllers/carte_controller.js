import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Carte média des pages projet (réf. erichuguenin.com) : la carte part à 90 %, ancrée en haut,
// et grandit jusqu'à 100 % une seule fois, quand son haut atteint 75 % de l'écran.
// L'image apparaît en fondu quand la carte est arrivée ET que l'image est chargée
// (les vidéos gardent leur image d'attente visible, sans fondu).
// Posé sur chaque .projet-media__cadre (partials _media_pleine et _media_paire).
// Seuls transform et opacity sont animés : la carte et son bouton vidéo restent atteignables au clavier.
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

    // Fondu de l'image : déclenché par la dernière des deux conditions (carte arrivée, image chargée)
    this.image = this.element.querySelector("img.projet-media__el")
    if (this.image) {
      gsap.set(this.image, { opacity: 0 })
      this.onImageReady = () => { this.imageReady = true; this.fadeImage() }
      if (this.image.complete && this.image.naturalWidth > 0) this.imageReady = true
      else {
        this.image.addEventListener("load", this.onImageReady, { once: true })
        this.image.addEventListener("error", this.onImageReady, { once: true }) // image cassée : le texte alternatif reste visible
      }
    }

    this.trigger = ScrollTrigger.create({
      trigger: this.element,
      start: "top 75%",
      once: true,
      onEnter: () => {
        this.entered = true
        this.fadeImage()
        this.tween = gsap.to(this.element, {
          scale: 1,
          duration: 1.1,
          ease: "back.out(1.1)",
          clearProps: "transform"
        })
      }
    })
  }

  fadeImage() {
    if (!this.entered || !this.imageReady || this.imageTween || !this.image) return
    this.imageTween = gsap.to(this.image, { opacity: 1, duration: 0.8, ease: "power2.out", clearProps: "opacity" })
  }

  // Carte à sa taille finale et image visible, sans animation (mouvement réduit, mise en cache Turbo, départ)
  showAll() {
    this.trigger?.kill()
    this.trigger = null
    this.tween?.kill()
    this.tween = null
    gsap.set(this.element, { clearProps: "transform,transformOrigin" })
    if (this.image) {
      this.image.removeEventListener("load", this.onImageReady)
      this.image.removeEventListener("error", this.onImageReady)
      this.imageTween?.kill()
      gsap.set(this.image, { clearProps: "opacity" })
    }
    this.imageTween = null
  }
}
