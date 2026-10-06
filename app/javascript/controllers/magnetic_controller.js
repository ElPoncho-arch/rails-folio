import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

// Lien « aimanté » : son contenu suit légèrement le curseur, puis revient avec un rebond.
// Par défaut c'est l'élément lui-même qui bouge ; avec des targets "item", seuls eux bougent
// (ex. le texte d'un grand lien dont le fond doit rester en place).
// Uniquement avec une souris (hover: hover et pointer: fine), jamais si mouvement réduit.
export default class extends Controller {
  static targets = ["item"]
  static values = {
    strength: { type: Number, default: 0.35 }, // part de la distance au centre
    max: { type: Number, default: 14 }          // décalage maximal, en pixels
  }

  connect() {
    this.query = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)")
    this.onQueryChange = () => (this.query.matches ? this.enable() : this.disable())
    this.query.addEventListener("change", this.onQueryChange)

    this.move = this.move.bind(this)
    this.leave = this.leave.bind(this)

    if (this.query.matches) this.enable()
  }

  disconnect() {
    this.query.removeEventListener("change", this.onQueryChange)
    this.disable()
  }

  enable() {
    if (this.enabled) return
    this.enabled = true
    this.element.addEventListener("pointermove", this.move)
    this.element.addEventListener("pointerleave", this.leave)
  }

  disable() {
    if (!this.enabled) return
    this.enabled = false
    this.element.removeEventListener("pointermove", this.move)
    this.element.removeEventListener("pointerleave", this.leave)
    this.xTo = this.yTo = null
    gsap.killTweensOf(this.movers)
    gsap.set(this.movers, { clearProps: "transform" })
  }

  move(event) {
    // Premier mouvement après un retour : on coupe le rebond et on repart de la position actuelle
    if (!this.xTo) {
      this.returnTween?.kill()
      this.xTo = gsap.quickTo(this.movers, "x", { duration: 0.5, ease: "power3" })
      this.yTo = gsap.quickTo(this.movers, "y", { duration: 0.5, ease: "power3" })
    }
    const rect = this.element.getBoundingClientRect()
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    this.xTo(gsap.utils.clamp(-this.maxValue, this.maxValue, dx * this.strengthValue))
    this.yTo(gsap.utils.clamp(-this.maxValue, this.maxValue, dy * this.strengthValue))
  }

  // Retour au repos avec un léger rebond
  leave() {
    this.xTo = this.yTo = null
    this.returnTween = gsap.to(this.movers, { x: 0, y: 0, duration: 0.7, ease: "back.out(3)", overwrite: true })
  }

  get movers() {
    return this.hasItemTarget ? this.itemTargets : [this.element]
  }
}
