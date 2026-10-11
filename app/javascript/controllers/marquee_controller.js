import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

// Bande qui défile en boucle (footer).
// La piste contient deux groupes identiques : on la décale de -50 %, puis on recommence.
// S'arrête en douceur au survol et quand le focus clavier est dans le footer (WCAG 2.2.2),
// en pause hors de l'écran, fixe si mouvement réduit.
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

    // La bande est en aria-hidden (non focusable) : on suit le focus dans le footer qui la contient
    this.zoneFocus = this.element.closest("footer") || this.element
    this.onFocusIn = () => this.pause()
    this.onFocusOut = (event) => {
      if (!this.zoneFocus.contains(event.relatedTarget)) this.resume()
    }
    this.zoneFocus.addEventListener("focusin", this.onFocusIn)
    this.zoneFocus.addEventListener("focusout", this.onFocusOut)

    // Largeur juste une fois la police chargée
    document.fonts.ready.then(() => {
      if (this.element.isConnected && !this.motion.matches) this.start()
    })
  }

  disconnect() {
    this.motion.removeEventListener("change", this.onMotionChange)
    this.observer.disconnect()
    this.zoneFocus.removeEventListener("focusin", this.onFocusIn)
    this.zoneFocus.removeEventListener("focusout", this.onFocusOut)
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

  // Survol ou focus : s'arrête en douceur, puis reprend sa vitesse
  pause() {
    if (this.tween) gsap.to(this.tween, { timeScale: 0, duration: 0.6, ease: "power2.out" })
  }

  resume() {
    if (this.tween) gsap.to(this.tween, { timeScale: 1, duration: 0.6, ease: "power2.out" })
  }
}
