import { Controller } from "@hotwired/stimulus"
import { gsap } from "gsap"

// Aperçu au survol de la liste des projets :
// une carte avec 1 ou 2 images suit le curseur (léger retard),
// les 2 images alternent en fondu. Images chargées au premier survol de la ligne.
// Ligne avec data-video (TF1) : un extrait vidéo muet en boucle remplace l'alternance,
// chargé au premier survol seulement (preload none), en fondu dès qu'il joue.
// Inactif sur les écrans sans survol ; fixe, sans rotation ni vidéo si mouvement réduit.
export default class extends Controller {
  static targets = ["card", "img", "video"]

  connect() {
    this.canHover = window.matchMedia("(hover: hover) and (pointer: fine)")
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    this.visible = false

    gsap.set(this.cardTarget, { autoAlpha: 0 })
    if (this.hasVideoTarget) gsap.set(this.videoTarget, { autoAlpha: 0 })
    this.xTo = gsap.quickTo(this.cardTarget, "x", { duration: 0.6, ease: "power3" })
    this.yTo = gsap.quickTo(this.cardTarget, "y", { duration: 0.6, ease: "power3" })
  }

  disconnect() {
    this.stopAlternate()
    this.stopVideo()
    gsap.killTweensOf([this.cardTarget, ...this.imgTargets])
  }

  // mouseenter sur une ligne
  select(event) {
    if (!this.canHover.matches) return
    const urls = JSON.parse(event.currentTarget.dataset.images || "[]")
    if (urls.length === 0) return

    const clip = this.reduced.matches ? null : event.currentTarget.dataset.video
    const [first, second] = this.imgTargets
    first.src = urls[0]
    second.src = urls[1] && !clip && !this.reduced.matches ? urls[1] : ""
    gsap.set(second, { autoAlpha: 0 })

    this.stopAlternate()
    this.stopVideo()
    if (clip) this.startVideo(clip)
    else if (second.getAttribute("src")) this.startAlternate(second)

    this.show(event)
  }

  // mousemove sur la liste
  move(event) {
    if (!this.canHover.matches || this.reduced.matches) return
    this.xTo(event.clientX)
    this.yTo(event.clientY)
  }

  // mouseleave de la liste
  hide() {
    if (!this.visible) return
    this.visible = false
    this.stopAlternate()
    this.stopVideo()
    gsap.to(this.cardTarget, { autoAlpha: 0, duration: 0.3, ease: "power1.out", overwrite: "auto" })
  }

  show(event) {
    if (this.visible) return
    this.visible = true

    if (this.reduced.matches) {
      // Position fixe (CSS), simple apparition
      gsap.set(this.cardTarget, { x: 0, y: 0, xPercent: 0, yPercent: -50, rotation: 0, scale: 1, autoAlpha: 1 })
      return
    }

    // Part de la position du curseur, sans traverser l'écran
    gsap.set(this.cardTarget, { x: event.clientX, y: event.clientY, xPercent: -50, yPercent: -50 })
    this.xTo(event.clientX)
    this.yTo(event.clientY)
    gsap.fromTo(this.cardTarget,
      { autoAlpha: 0, scale: 0.85, rotation: -6 },
      { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)", overwrite: "auto" })
  }

  startAlternate(img) {
    let shown = false
    this.timer = setInterval(() => {
      shown = !shown
      gsap.to(img, { autoAlpha: shown ? 1 : 0, duration: 0.8, ease: "power1.inOut" })
    }, 1600)
  }

  // src posé au premier survol seulement ; ensuite la vidéo déjà chargée est reprise
  startVideo(url) {
    if (!this.hasVideoTarget) return
    const video = this.videoTarget
    if (video.getAttribute("src") !== url) video.src = url
    this.onPlaying = () => gsap.to(video, { autoAlpha: 1, duration: 0.4, ease: "power1.out" })
    video.addEventListener("playing", this.onPlaying, { once: true })
    video.play().catch(() => {}) // lecture refusée : l'image reste affichée
  }

  stopVideo() {
    if (!this.hasVideoTarget) return
    const video = this.videoTarget
    video.removeEventListener("playing", this.onPlaying)
    video.pause()
    gsap.killTweensOf(video)
    gsap.set(video, { autoAlpha: 0 })
  }

  stopAlternate() {
    clearInterval(this.timer)
    this.timer = null
  }
}
