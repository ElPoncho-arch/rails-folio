import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Bande des disciplines : les mots apparaissent un à un, les flèches glissent vers la droite.
// Volontairement discret (courte durée, faible amplitude) pour ne pas concurrencer le hero.
// Si la bande est visible dès l'arrivée, elle attend la fin du nom du hero.
// Mouvement réduit : rien ne bouge.
export default class extends Controller {
  static targets = ["item"]

  connect() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    this.reset = this.showAll.bind(this)
    document.addEventListener("turbo:before-cache", this.reset)

    const isArrow = (el) => el.classList.contains("home-disciplines__arrow")
    const startedAt = performance.now()

    gsap.set(this.itemTargets, { opacity: 0 }) // jamais visibility : la liste reste lue par les lecteurs d'écran
    this.trigger = ScrollTrigger.create({
      trigger: this.element,
      start: "top 90%",
      once: true,
      onEnter: () => {
        this.tween = gsap.fromTo(this.itemTargets,
          { x: (i, el) => (isArrow(el) ? -8 : 0), y: (i, el) => (isArrow(el) ? 0 : 8) },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.45,
            ease: "back.out(1.2)",
            stagger: 0.06,
            delay: performance.now() - startedAt < 100 ? 1.3 : 0, // après le nom du hero (split_title)
            clearProps: "transform,opacity"
          })
      }
    })
  }

  disconnect() {
    document.removeEventListener("turbo:before-cache", this.reset)
    this.showAll()
  }

  // Tout afficher sans animation (mise en cache Turbo, départ)
  showAll() {
    this.trigger?.kill()
    this.trigger = null
    this.tween?.kill()
    this.tween = null
    gsap.set(this.itemTargets, { clearProps: "transform,opacity" })
  }
}
