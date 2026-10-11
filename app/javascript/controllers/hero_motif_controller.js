import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

// Hero de la home : portrait tramé sur fond tomate, nom et métier en crème.
// - Entrée au chargement : la trame monte comme un rideau, puis le nom et le métier arrivent ligne par ligne,
//   avec un léger rebond.
// - Dérive ensuite : la trame flotte lentement en boucle ; les textes restent fixes.
// - La dérive se met en pause quand le hero sort de l'écran.
// - Mouvement réduit : ni entrée ni dérive, tout est visible et fixe.
// L'état caché de l'entrée est posé ici (jamais en CSS) : si le JS échoue, les textes restent visibles.

// Positions extrêmes de la dérive (yoyo de l'une à l'autre)
const DERIVE_A = { xPercent: -3, yPercent: -2, rotation: -0.6, scale: 1.02 }
const DERIVE_B = { xPercent: 3, yPercent: 2.5, rotation: 0.6, scale: 1.06 }

export default class extends Controller {
  static targets = ["motif", "texte"]

  connect() {
    this.visible = true
    this.mm = gsap.matchMedia()
    this.mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(this.motifTarget, { clipPath: "inset(100% 0% 0% 0%)", yPercent: 8 })
      const lignes = this.texteTargets.flatMap((t) => [...t.querySelectorAll(".home-hero__ligne")])
      gsap.set(lignes, { autoAlpha: 0, y: 40 })

      // Dérive préparée en pause : raccord en douceur depuis la fin de l'entrée, puis aller-retour sans fin
      this.derive = gsap.timeline({ paused: true })
        .to(this.motifTarget, { ...DERIVE_A, duration: 4, ease: "sine.inOut" })
        .to(this.motifTarget, { ...DERIVE_B, duration: 22, ease: "sine.inOut", yoyo: true, repeat: -1 })

      this.entree = gsap.timeline({ onComplete: () => { this.deriveLancee = true; this.majDerive() } })
        .to(this.motifTarget, { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, duration: 1.1, ease: "power3.inOut" })
        .to(lignes, { autoAlpha: 1, y: 0, duration: 0.8, ease: "back.out(1.7)", stagger: 0.12 }, 0.75)

      // Au revert (préférence changée ou disconnect), GSAP tue les deux timelines et retire les styles
      return () => { this.derive = null; this.entree = null; this.deriveLancee = false }
    })

    this.observer = new IntersectionObserver(([entree]) => {
      this.visible = entree.isIntersecting
      this.majDerive()
    })
    this.observer.observe(this.element)
  }

  disconnect() {
    this.observer.disconnect()
    this.mm.revert() // tue la timeline et la dérive, retire les styles inline (compatible Turbo)
  }

  // Dérive active seulement après l'entrée et tant que le hero est à l'écran
  majDerive() {
    if (!this.derive) return
    this.deriveLancee && this.visible ? this.derive.play() : this.derive.pause()
  }
}
