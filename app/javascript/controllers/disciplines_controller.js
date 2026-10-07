import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Bande des disciplines : boucle horizontale continue (3 copies identiques, raccord invisible).
// Au repos, une dérive très lente ; au défilement, elle accélère avec la vitesse de la page
// (lue sur ScrollTrigger, synchronisé avec Lenis) et suit son sens. Vitesse lissée avec gsap.quickTo.
// Pause hors écran et au survol. Apparition en fondu à l'arrivée. Mouvement réduit : bande fixe.
const DERIVE = 18       // px/s au repos
const FACTEUR = 0.35    // part de la vitesse de défilement transmise à la bande
const MAX = 900         // px/s, plafond pour rester discret

export default class extends Controller {
  static targets = ["piste", "copie"]

  connect() {
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    this.onMotionChange = () => (this.motion.matches ? this.stop() : this.start())
    this.motion.addEventListener("change", this.onMotionChange)

    this.reset = this.stop.bind(this)
    document.addEventListener("turbo:before-cache", this.reset)

    if (!this.motion.matches) this.start()
  }

  disconnect() {
    this.motion.removeEventListener("change", this.onMotionChange)
    document.removeEventListener("turbo:before-cache", this.reset)
    this.stop()
  }

  start() {
    if (this.actif) return
    this.actif = true
    this.position = 0
    this.sens = 1
    this.etat = { vitesse: 0, facteur: 1 }
    this.vitesseVers = gsap.quickTo(this.etat, "vitesse", { duration: 0.8, ease: "power3.out" })
    this.setX = gsap.quickSetter(this.pisteTarget, "x", "px")

    // Largeur d'une copie : le décalage boucle sur cette valeur
    this.mesurer = () => { this.largeur = this.copieTargets[0].offsetWidth }
    this.mesurer()
    this.observer = new ResizeObserver(this.mesurer)
    this.observer.observe(this.copieTargets[0])

    this.tick = (temps, delta) => {
      if (!this.largeur) return
      const vitesse = (DERIVE * this.sens + this.etat.vitesse) * this.etat.facteur
      this.position += vitesse * Math.min(delta, 50) / 1000
      this.setX(-(((this.position % this.largeur) + this.largeur) % this.largeur))
    }

    // Visible à l'écran : la boucle tourne ; vitesse et sens suivent le défilement de la page
    this.trigger = ScrollTrigger.create({
      trigger: this.element,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? gsap.ticker.add(this.tick) : gsap.ticker.remove(this.tick)),
      onUpdate: (self) => {
        const v = self.getVelocity()
        if (Math.abs(v) > 20) this.sens = Math.sign(v)
        this.vitesseVers(gsap.utils.clamp(-MAX, MAX, v * FACTEUR))
        clearTimeout(this.repos)
        this.repos = setTimeout(() => this.vitesseVers(0), 120) // le défilement s'arrête : retour à la dérive
      }
    })

    // Apparition discrète, une fois
    gsap.set(this.pisteTarget, { opacity: 0 })
    this.apparition = ScrollTrigger.create({
      trigger: this.element,
      start: "top 90%",
      once: true,
      onEnter: () => gsap.to(this.pisteTarget, { opacity: 1, duration: 0.8, ease: "power2.out", clearProps: "opacity" })
    })
  }

  stop() {
    if (!this.actif) return
    this.actif = false
    gsap.ticker.remove(this.tick)
    clearTimeout(this.repos)
    this.trigger?.kill()
    this.apparition?.kill()
    this.observer?.disconnect()
    gsap.killTweensOf([this.etat, this.pisteTarget])
    gsap.set(this.pisteTarget, { clearProps: "transform,opacity" })
  }

  // Survol : la bande ralentit jusqu'à l'arrêt, puis repart
  pause() {
    if (this.actif) gsap.to(this.etat, { facteur: 0, duration: 0.6, ease: "power2.out" })
  }

  reprendre() {
    if (this.actif) gsap.to(this.etat, { facteur: 1, duration: 0.6, ease: "power2.out" })
  }
}
