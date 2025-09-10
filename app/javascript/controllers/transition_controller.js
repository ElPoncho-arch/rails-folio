import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["container", "overlay"]

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

    // NEW: affiche le loader
    const loader = document.getElementById("app-loader")
    if (loader) loader.classList.add("is-visible")
  }

  enter() {
    document.documentElement.classList.remove("is-leaving")
    if (this.hasContainerTarget) {
      this.containerTarget.classList.add("is-entering")
      requestAnimationFrame(() => this.containerTarget.classList.remove("is-entering"))
    }

    // NEW: on attend que les images lazy critiques confirment "ready" (voir contrôleur lazy-image)
    const loader = document.getElementById("app-loader")
    if (!loader) return

    // Si rien n'est en attente, on cache tout de suite
    if (!window.__lazyAwaitingCount || window.__lazyAwaitingCount === 0) {
      loader.classList.remove("is-visible")
    } else {
      // sécurité : timeout max au cas où
      setTimeout(() => loader.classList.remove("is-visible"), 3000)
    }
  }

  reset() {
    if (this.hasContainerTarget) {
      this.containerTarget.classList.remove("is-entering", "is-leaving")
    }
    document.documentElement.classList.remove("is-leaving")

    // NEW: reset loader au cache
    const loader = document.getElementById("app-loader")
    if (loader) loader.classList.remove("is-visible")
  }
}
