import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

// Aperçu au survol de la liste des projets :
// une carte avec une image par projet suit le curseur (léger retard).
// Image chargée au premier survol de la ligne.
// Inactif sur les écrans sans survol ; fixe et sans rotation si mouvement réduit.
export default class extends Controller {
  static targets = ["card", "img"]

  connect() {
    this.canHover = window.matchMedia("(hover: hover) and (pointer: fine)")
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    this.visible = false

    gsap.set(this.cardTarget, { autoAlpha: 0 })
    this.xTo = gsap.quickTo(this.cardTarget, "x", { duration: 0.6, ease: "power3" })
    this.yTo = gsap.quickTo(this.cardTarget, "y", { duration: 0.6, ease: "power3" })
  }

  disconnect() {
    gsap.killTweensOf(this.cardTarget)
  }

  // mouseenter sur une ligne
  select(event) {
    if (!this.canHover.matches) return
    const url = event.currentTarget.dataset.image
    if (!url) return this.hide() // projet sans image : la carte précédente ne reste pas affichée

    this.imgTarget.src = url
    this.show(event)
  }

  // mousemove sur la liste
  move(event) {
    if (!this.canHover.matches || this.reduced.matches) return
    this.xTo(event.clientX)
    this.yTo(event.clientY)
  }

  // mouseleave de la liste
  hide() {
    if (!this.visible) return
    this.visible = false
    gsap.to(this.cardTarget, { autoAlpha: 0, duration: 0.3, ease: "power1.out", overwrite: "auto" })
  }

  show(event) {
    if (this.visible) return
    this.visible = true

    if (this.reduced.matches) {
      // Position fixe (CSS), simple apparition
      gsap.set(this.cardTarget, { x: 0, y: 0, xPercent: 0, yPercent: -50, rotation: 0, scale: 1, autoAlpha: 1 })
      return
    }

    // Part de la position du curseur, sans traverser l'écran
    gsap.set(this.cardTarget, { x: event.clientX, y: event.clientY, xPercent: -50, yPercent: -50 })
    this.xTo(event.clientX)
    this.yTo(event.clientY)
    gsap.fromTo(this.cardTarget,
      { autoAlpha: 0, scale: 0.85, rotation: -6 },
      { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)", overwrite: "auto" })
  }
}
