import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

// Bande qui défile en boucle (footer).
// La piste contient deux groupes identiques : on la décale de -50 %, puis on recommence.
// Ralentit au survol, en pause hors de l'écran, fixe si mouvement réduit.
export default class extends Controller {
  static targets = ["track"]
  static values = { speed: { type: Number, default: 60 } } // pixels par seconde

  connect() {
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    this.onMotionChange = () => (this.motion.matches ? this.stop() : this.start())
    this.motion.addEventListener("change", this.onMotionChange)

    // En pause quand la bande n'est pas visible
    this.observer = new IntersectionObserver(([entry]) => {
      if (!this.tween) return
      entry.isIntersecting ? this.tween.play() : this.tween.pause()
    })
    this.observer.observe(this.element)

    // Largeur juste une fois la police chargée
    document.fonts.ready.then(() => {
      if (this.element.isConnected && !this.motion.matches) this.start()
    })
  }

  disconnect() {
    this.motion.removeEventListener("change", this.onMotionChange)
    this.observer.disconnect()
    this.stop()
  }

  start() {
    if (this.tween) return
    const distance = this.trackTarget.scrollWidth / 2
    this.tween = gsap.to(this.trackTarget, {
      xPercent: -50,
      duration: distance / this.speedValue,
      ease: "none",
      repeat: -1
    })
  }

  stop() {
    this.tween?.kill()
    this.tween = null
    gsap.set(this.trackTarget, { clearProps: "transform" })
  }

  // Survol : ralentit en douceur, puis reprend sa vitesse
  slow() {
    if (this.tween) gsap.to(this.tween, { timeScale: 0.25, duration: 0.6, ease: "power2.out" })
  }

  resume() {
    if (this.tween) gsap.to(this.tween, { timeScale: 1, duration: 0.6, ease: "power2.out" })
  }
}
