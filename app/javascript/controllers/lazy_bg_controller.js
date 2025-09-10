import { Controller } from "@hotwired/stimulus"

function incAwait() { window.__lazyAwaitingCount = (window.__lazyAwaitingCount || 0) + 1 }
function decAwait() { window.__lazyAwaitingCount = Math.max((window.__lazyAwaitingCount || 1) - 1, 0) }

export default class extends Controller {
  static values = { src: String }

  connect() {
    this.element.classList.add("lazy-bg")
    const loadIt = () => {
      const url = this.srcValue || this.element.dataset.src
      if (!url) return
      incAwait()
      const img = new Image()
      img.onload = () => {
        this.element.style.backgroundImage = `url("${url}")`
        this.element.classList.add("is-loaded")
        decAwait()
      }
      img.onerror = () => decAwait()
      img.src = url
    }

    if ("IntersectionObserver" in window) {
      this._observer = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
          this._observer.disconnect()
          loadIt()
        }
      }, { rootMargin: "200px 0px" })
      this._observer.observe(this.element)
    } else {
      loadIt()
    }
  }

  disconnect() {
    if (this._observer) this._observer.disconnect()
  }
}
