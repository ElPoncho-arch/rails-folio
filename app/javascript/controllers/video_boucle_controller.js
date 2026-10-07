import { Controller } from "@hotwired/stimulus"

// Vidéo muette en boucle (helpers media_video_tag et media_gif_video_tag).
// - bouton lecture / pause ajouté dans le cadre de la vidéo (WCAG 2.2.2),
//   sauf avec data-video-boucle-bouton-value="false" (GIF, sans bouton) ;
// - pause hors de l'écran, reprise en revenant ;
// - mouvement réduit : en pause sur l'image d'attente, lecture seulement au clic sur le bouton
//   (un GIF sans bouton reste sur son image d'attente).
// La lecture est pilotée ici : l'attribut autoplay ne sert que sans JS.
const ICONES = {
  lecture: '<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M2 1l7 4-7 4z"/></svg>',
  pause: '<svg viewBox="0 0 10 10" aria-hidden="true" focusable="false"><path d="M2 1h2v8H2zM6 1h2v8H6z"/></svg>'
}

export default class extends Controller {
  static values = { bouton: { type: Boolean, default: true } }

  connect() {
    this.video = this.element
    this.video.autoplay = false
    this.userPaused = false
    this.visible = false

    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    this.onMotionChange = () => this.update()
    this.motion.addEventListener("change", this.onMotionChange)

    if (this.boutonValue) this.addButton()
    this.onStateChange = () => this.render()
    this.video.addEventListener("play", this.onStateChange)
    this.video.addEventListener("pause", this.onStateChange)

    this.observer = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting
      this.update()
    })
    this.observer.observe(this.video)

    // Mouvement réduit dès l'arrivée : retour à l'image d'attente si la lecture a déjà commencé
    if (this.motion.matches) this.rest()
  }

  disconnect() {
    this.motion.removeEventListener("change", this.onMotionChange)
    this.video.removeEventListener("play", this.onStateChange)
    this.video.removeEventListener("pause", this.onStateChange)
    this.observer.disconnect()
    this.button?.remove()
  }

  // Lecture automatique seulement si visible, sans mouvement réduit et non mise en pause par le visiteur
  update() {
    if (this.visible && !this.motion.matches && !this.userPaused) {
      this.video.play().catch(() => this.render()) // autoplay refusé : le bouton reste sur « lecture »
    } else {
      this.video.pause()
    }
  }

  toggle() {
    if (this.video.paused) {
      this.userPaused = false
      this.video.play().catch(() => this.render())
    } else {
      this.userPaused = true
      this.video.pause()
    }
  }

  rest() {
    this.video.pause()
    if (this.video.currentTime > 0) this.video.load() // réaffiche l'image d'attente
  }

  addButton() {
    // Un bouton resté dans un instantané Turbo est remplacé
    this.video.parentElement.querySelector(":scope > .video-boucle__bouton")?.remove()

    this.button = document.createElement("button")
    this.button.type = "button"
    this.button.className = "video-boucle__bouton"
    this.button.addEventListener("click", () => this.toggle())
    this.video.after(this.button)
    this.render()
  }

  render() {
    if (!this.button) return
    const etat = this.video.paused ? "lecture" : "pause"
    const sujet = this.video.getAttribute("aria-label")
    this.button.innerHTML = `${ICONES[etat]}<span>${etat}</span>`
    // Nom accessible : commence par le texte visible, précise la vidéo
    this.button.setAttribute("aria-label", sujet ? `${etat} : ${sujet}` : etat)
  }
}
