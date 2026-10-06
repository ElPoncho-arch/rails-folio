import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(SplitText)

// Titre qui monte depuis un masque, à l'arrivée sur la page.
// data-split-title-type-value : "chars" (nom du hero) ou "words" (titres des pages projet).
// SplitText (aria: "auto") pose un aria-label avec le titre entier et masque chaque morceau
// aux lecteurs d'écran : le titre est lu d'un bloc, pas lettre par lettre.
// Le titre n'est caché qu'en JS, le temps que la police charge. Mouvement réduit : aucun découpage.
export default class extends Controller {
  static values = { type: { type: String, default: "words" } }

  connect() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    this.reset = this.revert.bind(this)
    document.addEventListener("turbo:before-cache", this.reset)

    gsap.set(this.element, { autoAlpha: 0 })
    // Découpage une fois la police chargée, sinon les morceaux sont mal mesurés
    document.fonts.ready.then(() => {
      if (this.element.isConnected) this.play()
    })
  }

  disconnect() {
    document.removeEventListener("turbo:before-cache", this.reset)
    this.revert()
  }

  play() {
    const type = this.typeValue === "chars" ? "chars" : "words"
    this.split = SplitText.create(this.element, {
      type,
      mask: type,
      aria: "auto",
      [`${type}Class`]: `split-${type.slice(0, -1)}`,
      // Mots : on garde les espaces insécables de nom_insecable (« TF1 — » reste groupé)
      ...(type === "words" && { reduceWhiteSpace: false, wordDelimiter: " " })
    })
    // aria-label repris du texte brut : on resserre les espaces et retours à la ligne du HTML
    const label = this.element.getAttribute("aria-label")
    if (label) this.element.setAttribute("aria-label", label.replace(/\s+/g, " "))

    gsap.set(this.element, { autoAlpha: 1 })
    this.tween = gsap.from(this.split[type], {
      yPercent: 110,
      duration: 0.9,
      ease: "back.out(1.4)",
      stagger: type === "chars" ? 0.035 : 0.08,
      delay: 0.15, // laisse démarrer le fondu de page
      onComplete: () => this.revert()
    })
  }

  // Remet le titre d'origine (fin d'animation, mise en cache Turbo, départ)
  revert() {
    this.tween?.kill()
    this.tween = null
    this.split?.revert()
    this.split = null
    gsap.set(this.element, { clearProps: "opacity,visibility" })
  }
}
