import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

// Hero de la home : portrait tramé sur fond orange, nom et métier en encre.
// - Entrée au chargement : la trame monte comme un rideau ; le nom et le métier, visibles dès le premier
//   affichage (élément LCP), glissent en place ligne par ligne avec un léger rebond.
// - Dérive ensuite (dès 768 px seulement : épargne les téléphones) : la trame flotte lentement en boucle.
// - La dérive se met en pause quand le hero sort de l'écran.
// - Première arrivée : l'entrée attend la fin du loader (événement « intro:revele », intro_controller.js).
// - Mouvement réduit : ni entrée ni dérive, tout est visible et fixe.
// Les textes ne sont jamais masqués : seul leur décalage est posé ici (jamais en CSS).

// Positions extrêmes de la dérive (yoyo de l'une à l'autre)
const DERIVE_A = { xPercent: -1.5, yPercent: -1, rotation: -0.4, scale: 1.01 }
const DERIVE_B = { xPercent: 1.5, yPercent: 1.2, rotation: 0.4, scale: 1.03 }

export default class extends Controller {
  static targets = ["motif", "texte"]

  connect() {
    this.visible = true
    this.mm = gsap.matchMedia()
    const conditions = { anim: "(prefers-reduced-motion: no-preference)", large: "(min-width: 768px)" }
    this.mm.add(conditions, ({ conditions: { anim, large } }) => {
      if (!anim) return
      gsap.set(this.motifTarget, { clipPath: "inset(100% 0% 0% 0%)", yPercent: 8 })
      const lignes = this.texteTargets.flatMap((t) => [...t.querySelectorAll(".home-hero__ligne")])
      gsap.set(lignes, { y: 40 })

      // Dérive préparée en pause : raccord en douceur depuis la fin de l'entrée, puis aller-retour sans fin
      if (large) {
        this.derive = gsap.timeline({ paused: true })
          .to(this.motifTarget, { ...DERIVE_A, duration: 4, ease: "sine.inOut" })
          .to(this.motifTarget, { ...DERIVE_B, duration: 22, ease: "sine.inOut", yoyo: true, repeat: -1 })
      }

      this.entree = gsap.timeline({ onComplete: () => { this.deriveLancee = true; this.majDerive() } })
        .to(this.motifTarget, { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, duration: 1.1, ease: "power3.inOut" })
        .to(lignes, { y: 0, duration: 0.9, ease: "back.out(1.7)", stagger: 0.1 }, 0.1)

      // Loader de première arrivée en cours (intro_controller.js) : la trame est déjà en place,
      // c'est la dissolution du loader qui la dévoile ; seuls le nom et le métier glissent ensuite
      if (document.documentElement.classList.contains("intro-en-cours")) {
        this.entree.pause()
        gsap.set(this.motifTarget, { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0 })
        this.surIntro = () => this.entree?.play()
        window.addEventListener("intro:revele", this.surIntro, { once: true })
      }

      // Au revert (préférence changée ou disconnect), GSAP tue les deux timelines et retire les styles
      return () => {
        window.removeEventListener("intro:revele", this.surIntro)
        this.derive = null; this.entree = null; this.deriveLancee = false
      }
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
