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
// Seules opacity et y sont animées, jamais visibility : un élément pas encore apparu
// reste atteignable au clavier et lu par les lecteurs d'écran. Il s'affiche aussitôt
// s'il reçoit le focus avant d'être arrivé à l'écran.
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

    this.onFocusIn = this.showFocused.bind(this)
    this.element.addEventListener("focusin", this.onFocusIn)

    if (!this.motion.matches) this.setup()
  }

  disconnect() {
    this.motion.removeEventListener("change", this.onMotionChange)
    document.removeEventListener("turbo:before-cache", this.reset)
    this.element.removeEventListener("focusin", this.onFocusIn)
    this.showAll()
  }

  setup() {
    const items = this.itemTargets.filter((el) => !el.matches(SPLIT_TITLE) && !el.querySelector(SPLIT_TITLE))
    if (items.length === 0) return

    // Les premiers éléments visibles attendent la fin du fondu de page (transition)
    const startedAt = performance.now()

    gsap.set(items, { opacity: 0, y: 24 })
    this.shown = new Set()
    this.triggers = ScrollTrigger.batch(items, {
      start: "top 90%",
      once: true,
      onEnter: (batch) => {
        batch = batch.filter((el) => !this.shown.has(el))
        batch.forEach((el) => this.shown.add(el))
        if (batch.length === 0) return
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "back.out(1.2)",
          stagger: 0.08,
          delay: performance.now() - startedAt < 100 ? 0.3 : 0,
          clearProps: "transform,opacity"
        })
      }
    })
    this.items = items
  }

  // Focus clavier sur un élément pas encore apparu : affiché tout de suite, sans animation
  showFocused(event) {
    const item = this.items?.find((el) => el.contains(event.target))
    if (!item || this.shown.has(item)) return
    this.shown.add(item)
    gsap.killTweensOf(item)
    gsap.set(item, { clearProps: "transform,opacity" })
  }

  // Affiche tout sans animation (mouvement réduit, mise en cache Turbo, départ)
  showAll() {
    this.triggers?.forEach((trigger) => trigger.kill())
    this.triggers = null
    if (this.items) {
      gsap.killTweensOf(this.items)
      gsap.set(this.items, { clearProps: "transform,opacity" })
      this.items = null
    }
  }
}
