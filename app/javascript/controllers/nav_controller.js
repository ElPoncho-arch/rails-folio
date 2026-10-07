import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

// Nav pilule : se compacte au scroll vers le bas (desktop),
// ouvre un panneau plein écran (mobile) qui descend comme un rideau.
// Mouvement réduit : ouverture et fermeture instantanées.
export default class extends Controller {
  static targets = ["pill", "toggle", "toggleTexte", "panel", "item", "bas"]

  connect() {
    this.desktop = window.matchMedia("(min-width: 992px)")
    this.lastY = window.scrollY
    this.ticking = false
    this.opened = false
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)")
  }

  disconnect() {
    this.closeNow()
  }

  // --- Compactage (desktop) ---

  onScroll() {
    if (this.ticking) return
    this.ticking = true
    requestAnimationFrame(() => {
      const y = window.scrollY
      const delta = y - this.lastY
      if (y < 120) this.setCompact(false)
      else if (delta > 4) this.setCompact(true)
      else if (delta < -4) this.setCompact(false)
      this.lastY = y
      this.ticking = false
    })
  }

  expand() {
    this.setCompact(false)
  }

  onLeave() {
    if (window.scrollY >= 120) this.setCompact(true)
  }

  setCompact(compact) {
    // Si la souris est sur la pilule, on la garde dépliée
    if (compact && this.pillTarget.matches(":hover")) return
    this.pillTarget.classList.toggle("is-compact", compact && this.desktop.matches)
  }

  // --- Menu (bouton « menu ») : rideau tomate ---

  toggle() {
    if (this.desktop.matches) return this.expand()
    this.opened ? this.close() : this.open()
  }

  open() {
    if (this.opened) return
    this.opened = true
    this.timeline?.kill()
    this.panelTarget.style.setProperty("--nav-pill-bas", `${this.pillTarget.getBoundingClientRect().bottom}px`)
    this.panelTarget.hidden = false
    this.setToggle(true)
    document.documentElement.classList.add("nav-is-open")
    this.setInert(true)
    this.dispatch("open")
    this.focusables()[1]?.focus()

    if (this.motion.matches) return this.resetStyles()

    // Le rideau descend, puis les liens montent en cascade, puis le bas du panneau
    this.timeline = gsap.timeline()
      .fromTo(this.panelTarget, { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.5, ease: "power3.out" })
      .fromTo(this.itemTargets, { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: "back.out(1.4)" }, "-=0.2")
      .fromTo(this.basTarget, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, "-=0.3")
  }

  // Aussi appelé au clic sur un lien du panneau : la page est rendue tout de suite
  // (défilement, ancre), le rideau remonte par-dessus
  close() {
    if (!this.opened) return
    this.opened = false
    this.timeline?.kill()
    this.setToggle(false)
    document.documentElement.classList.remove("nav-is-open")
    this.setInert(false)
    this.dispatch("close")

    if (this.motion.matches) return this.hidePanel()

    this.timeline = gsap.timeline({ onComplete: () => this.hidePanel() })
      .to(this.panelTarget, { clipPath: "inset(0 0 100% 0)", duration: 0.3, ease: "power2.in" })
  }

  // Sans animation : mise en cache Turbo, départ du controller
  closeNow() {
    this.close()
    this.timeline?.kill()
    this.timeline = null
    this.hidePanel()
  }

  hidePanel() {
    if (this.opened) return
    this.panelTarget.hidden = true
    this.resetStyles()
  }

  resetStyles() {
    gsap.set([this.panelTarget, ...this.itemTargets, this.basTarget], { clearProps: "clipPath,transform,opacity" })
  }

  setToggle(open) {
    this.toggleTarget.setAttribute("aria-expanded", String(open))
    this.toggleTexteTarget.textContent = open ? "fermer" : "menu"
  }

  onKeydown(event) {
    if (!this.opened) return
    if (event.key === "Escape") {
      this.close()
      this.toggleTarget.focus()
    } else if (event.key === "Tab") {
      this.trapFocus(event)
    }
  }

  onResize() {
    if (this.desktop.matches) this.closeNow()
    else this.pillTarget.classList.remove("is-compact")
  }

  // Le focus tourne entre le bouton et les liens du panneau
  trapFocus(event) {
    const items = this.focusables()
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  // Panneau ouvert : la page derrière n'est plus atteignable (clavier, lecteurs d'écran)
  setInert(inert) {
    document.querySelectorAll("#contenu, .site-footer").forEach((el) => { el.inert = inert })
  }

  focusables() {
    return [this.toggleTarget, ...this.panelTarget.querySelectorAll("a")]
  }
}
