import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

// Apparition au scroll : chaque élément marqué monte de 24 px en fondu, une seule fois.
// Les éléments qui entrent ensemble sont légèrement décalés.
// Posé sur #page ; les éléments s'inscrivent avec data-reveal-target="item".
// - jamais sur un titre animé par split-title (ni sur un bloc qui en contient un) ;
// - jamais sur un ancêtre d'un élément fixed (ex. carte d'aperçu des projets) :
//   un transform le décalerait. Les transforms sont retirés après l'apparition.
// Mouvement réduit : tout est affiché directement.
const SPLIT_TITLE = "[data-controller~='split-title']"

export default class extends Controller {
  static targets = ["item"]

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
    const items = this.itemTargets.filter((el) => !el.matches(SPLIT_TITLE) && !el.querySelector(SPLIT_TITLE))
    if (items.length === 0) return

    // Les premiers éléments visibles attendent la fin du fondu de page (transition)
    const startedAt = performance.now()

    gsap.set(items, { autoAlpha: 0, y: 24 })
    this.triggers = ScrollTrigger.batch(items, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "back.out(1.2)",
          stagger: 0.08,
          delay: performance.now() - startedAt < 100 ? 0.3 : 0,
          clearProps: "transform,opacity,visibility"
        })
      }
    })
    this.items = items
  }

  // Affiche tout sans animation (mouvement réduit, mise en cache Turbo, départ)
  showAll() {
    this.triggers?.forEach((trigger) => trigger.kill())
    this.triggers = null
    if (this.items) {
      gsap.killTweensOf(this.items)
      gsap.set(this.items, { clearProps: "transform,opacity,visibility" })
      this.items = null
    }
  }
}
