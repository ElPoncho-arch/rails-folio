import { Controller } from "@hotwired/stimulus"

// Vidéo muette en boucle (helpers media_video_tag et media_gif_video_tag), sans bouton :
// - pause hors de l'écran, reprise en revenant ;
// - mouvement réduit : en pause sur l'image d'attente.
// La lecture est pilotée ici : l'attribut autoplay ne sert que sans JS.
export default class extends Controller {
  connect() {
    this.video = this.element
    this.video.autoplay = false
    this.visible = false

    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    this.onMotionChange = () => this.update()
    this.motion.addEventListener("change", this.onMotionChange)

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
    this.observer.disconnect()
  }

  // Lecture automatique seulement si visible et sans mouvement réduit
  update() {
    if (this.visible && !this.motion.matches) {
      this.video.play().catch(() => {}) // autoplay refusé : l'image d'attente reste affichée
    } else {
      this.video.pause()
    }
  }

  rest() {
    this.video.pause()
    if (this.video.currentTime > 0) this.video.load() // réaffiche l'image d'attente
  }
}
