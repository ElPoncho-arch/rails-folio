import { Controller } from "@hotwired/stimulus"

// Fondu entre les pages (Turbo) + loader pendant le chargement
export default class extends Controller {
  static targets = ["container"]

  connect() {
    this._leave = this.leave.bind(this)
    this._enter = this.enter.bind(this)
    this._reset = this.reset.bind(this)

    document.addEventListener("turbo:before-visit", this._leave)
    document.addEventListener("turbo:load", this._enter)
    document.addEventListener("turbo:before-cache", this._reset)

    // Entrée au premier paint
    this.enter()
  }

  disconnect() {
    document.removeEventListener("turbo:before-visit", this._leave)
    document.removeEventListener("turbo:load", this._enter)
    document.removeEventListener("turbo:before-cache", this._reset)
  }

  leave() {
    document.documentElement.classList.add("is-leaving")
    if (this.hasContainerTarget) this.containerTarget.classList.add("is-leaving")
    this.loader?.classList.add("is-visible")
  }

  enter() {
    document.documentElement.classList.remove("is-leaving")
    if (this.hasContainerTarget) {
      this.containerTarget.classList.add("is-entering")
      requestAnimationFrame(() => this.containerTarget.classList.remove("is-entering"))
    }
    this.loader?.classList.remove("is-visible")
  }

  reset() {
    if (this.hasContainerTarget) {
      this.containerTarget.classList.remove("is-entering", "is-leaving")
    }
    document.documentElement.classList.remove("is-leaving")
    this.loader?.classList.remove("is-visible")
  }

  get loader() {
    return document.getElementById("app-loader")
  }
}
