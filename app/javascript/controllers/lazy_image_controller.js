import { Controller } from "@hotwired/stimulus"

function incAwait() { window.__lazyAwaitingCount = (window.__lazyAwaitingCount || 0) + 1 }
function decAwait() { window.__lazyAwaitingCount = Math.max((window.__lazyAwaitingCount || 1) - 1, 0) }

export default class extends Controller {
  static values = { src: String, alt: String }

  connect() {
    this.element.classList.add("lazy-img")
    if ("IntersectionObserver" in window) {
      this._observer = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
          this._observer.disconnect()
          this._load()
        }
      }, { rootMargin: "200px 0px" })
      this._observer.observe(this.element)
    } else {
      this._load()
    }
  }

  disconnect() {
    if (this._observer) this._observer.disconnect()
  }

  _load() {
    const realSrc = this.srcValue || this.element.dataset.src
    if (!realSrc) return

    incAwait()
    const img = new Image()
    img.onload = () => {
      this.element.src = realSrc
      if (this.hasAltValue) this.element.alt = this.altValue
      this.element.addEventListener("load", () => {
        this.element.classList.add("is-loaded")
        decAwait()
        if (window.__lazyAwaitingCount === 0) {
          const loader = document.getElementById("app-loader")
          if (loader) loader.classList.remove("is-visible")
        }
      }, { once: true })
    }
    img.onerror = () => decAwait()
    img.src = realSrc
  }
}
