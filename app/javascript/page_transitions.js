import { Turbo } from "@hotwired/turbo-rails"

const TRANSITION_DURATION = 1000

// helper pour sortir puis naviguer
function fadeOutAndGo(url) {
  document.body.classList.add("turbo-exit")
  setTimeout(() => Turbo.visit(url), TRANSITION_DURATION)
}

// au clic sur un lien Turbo
document.addEventListener("turbo:click", e => {
  e.preventDefault()
  fadeOutAndGo(e.detail.url)
})

// avant de rendre la nouvelle page : on retire la classe pour fade-in
document.addEventListener("turbo:before-render", () => {
  document.body.classList.remove("turbo-exit")
})