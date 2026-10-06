import { Controller } from "@hotwired/stimulus"

// Nav pilule : se compacte au scroll vers le bas (desktop),
// ouvre un panneau plein écran (mobile).
export default class extends Controller {
  static targets = ["pill", "toggle", "panel"]

  connect() {
    this.desktop = window.matchMedia("(min-width: 992px)")
    this.lastY = window.scrollY
    this.ticking = false
  }

  disconnect() {
    this.close()
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

  // --- Menu (bouton « menu ») ---

  toggle() {
    if (this.desktop.matches) return this.expand()
    this.isOpen ? this.close() : this.open()
  }

  open() {
    this.panelTarget.hidden = false
    this.toggleTarget.setAttribute("aria-expanded", "true")
    this.toggleTarget.textContent = "fermer"
    document.documentElement.classList.add("nav-is-open")
    this.dispatch("open")
    this.focusables()[1]?.focus()
  }

  close() {
    if (!this.isOpen) return
    this.panelTarget.hidden = true
    this.toggleTarget.setAttribute("aria-expanded", "false")
    this.toggleTarget.textContent = "menu"
    document.documentElement.classList.remove("nav-is-open")
    this.dispatch("close")
  }

  onKeydown(event) {
    if (!this.isOpen) return
    if (event.key === "Escape") {
      this.close()
      this.toggleTarget.focus()
    } else if (event.key === "Tab") {
      this.trapFocus(event)
    }
  }

  onResize() {
    if (this.desktop.matches) this.close()
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

  focusables() {
    return [this.toggleTarget, ...this.panelTarget.querySelectorAll("a")]
  }

  get isOpen() {
    return !this.panelTarget.hidden
  }
}
