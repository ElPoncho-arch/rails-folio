import { Controller } from "@hotwired/stimulus"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Lenis global, posé sur <html> : Turbo ne remplace jamais <html>,
// donc une seule instance pour toute la session.
// Désactivé si l'utilisateur préfère réduire les animations.
export default class extends Controller {
  connect() {
    this.tick = (time) => this.lenis?.raf(time * 1000)
    this.stop = () => this.lenis?.stop()
    this.sync = this.sync.bind(this)

    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    this.onMotionChange = () => (this.motion.matches ? this.destroyLenis() : this.createLenis())
    this.motion.addEventListener("change", this.onMotionChange)

    // Transitions de page (le controller transition reste inchangé)
    document.addEventListener("turbo:visit", this.stop)
    document.addEventListener("turbo:load", this.sync)

    // Menu mobile de la nav
    document.addEventListener("nav:open", this.stop)
    document.addEventListener("nav:close", this.sync)

    if (!this.motion.matches) this.createLenis()
  }

  disconnect() {
    this.motion.removeEventListener("change", this.onMotionChange)
    document.removeEventListener("turbo:visit", this.stop)
    document.removeEventListener("turbo:load", this.sync)
    document.removeEventListener("nav:open", this.stop)
    document.removeEventListener("nav:close", this.sync)
    this.destroyLenis()
  }

  createLenis() {
    if (this.lenis) return
    this.lenis = new Lenis({ autoRaf: false, anchors: true })

    // Lenis piloté par le ticker GSAP, ScrollTrigger mis à jour à chaque défilement
    this.lenis.on("scroll", ScrollTrigger.update)
    gsap.ticker.add(this.tick)
    gsap.ticker.lagSmoothing(0)
  }

  destroyLenis() {
    if (!this.lenis) return
    gsap.ticker.remove(this.tick)
    gsap.ticker.lagSmoothing(500, 33) // valeurs par défaut de GSAP
    this.lenis.destroy()
    this.lenis = null
  }

  // Après une visite Turbo : on repart de la position fixée par Turbo
  // (haut de page, ancre ou position restaurée au retour arrière)
  sync() {
    if (this.lenis) {
      this.lenis.resize()
      this.lenis.scrollTo(window.scrollY, { immediate: true, force: true })
      this.lenis.start()
    }
    ScrollTrigger.refresh()
  }
}
