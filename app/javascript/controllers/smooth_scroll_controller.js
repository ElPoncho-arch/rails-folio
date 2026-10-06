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

    // Images et vidéos (souvent Cloudinary, en lazy) : leur hauteur arrive après coup,
    // on recalcule les déclencheurs ScrollTrigger une fois les chargements groupés
    this.onMediaLoad = (event) => {
      if (event.target instanceof HTMLImageElement || event.target instanceof HTMLVideoElement) this.queueRefresh()
    }
    document.addEventListener("load", this.onMediaLoad, true)
    document.addEventListener("loadedmetadata", this.onMediaLoad, true)

    // Polices : tant qu'elles ne sont pas chargées, les titres n'ont pas leur hauteur finale
    document.fonts.ready.then(() => this.queueRefresh())

    if (!this.motion.matches) this.createLenis()
  }

  disconnect() {
    this.motion.removeEventListener("change", this.onMotionChange)
    document.removeEventListener("turbo:visit", this.stop)
    document.removeEventListener("turbo:load", this.sync)
    document.removeEventListener("nav:open", this.stop)
    document.removeEventListener("nav:close", this.sync)
    document.removeEventListener("load", this.onMediaLoad, true)
    document.removeEventListener("loadedmetadata", this.onMediaLoad, true)
    clearTimeout(this.refreshTimer)
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

  queueRefresh() {
    clearTimeout(this.refreshTimer)
    this.refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150)
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
