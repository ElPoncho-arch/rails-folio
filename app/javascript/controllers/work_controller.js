import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["card"]

  connect() {
    // Désactive le tooltip sur mobile (écrans tactiles)
    if (matchMedia("(pointer: coarse)").matches) return

    this.tooltip = document.createElement("div")
    this.tooltip.className = "custom-tooltip"
    this.tooltip.style.display = "none"
    document.body.appendChild(this.tooltip)

    this.cardTargets.forEach(card => {
      card.addEventListener("mouseenter", this._onEnter)
      card.addEventListener("mousemove", this._onMove)
      card.addEventListener("mouseleave", this._onLeave)
    })
  }

  disconnect() {
    if (this.tooltip) this.tooltip.remove()
    this.cardTargets.forEach(card => {
      card.removeEventListener("mouseenter", this._onEnter)
      card.removeEventListener("mousemove", this._onMove)
      card.removeEventListener("mouseleave", this._onLeave)
    })
  }

  _onEnter = (e) => {
    const name = e.currentTarget.dataset.projectName || "Projet"
    this.tooltip.textContent = `> ${name}`
    this.tooltip.style.display = "block"
  }

  _onMove = (e) => {
    const offset = 14
    this.tooltip.style.left = `${e.pageX + offset}px`
    this.tooltip.style.top  = `${e.pageY + offset}px`
  }

  _onLeave = () => {
    this.tooltip.style.display = "none"
  }
}
