import { Controller } from "@hotwired/stimulus"

// Loader de première arrivée, une fois par session (piste 1c) : sur fond orange, la pastille « fh »
// (d'après la favicon ronde de la V1) se trame au rythme du vrai chargement — polices et trame du hero —,
// puis l'écran se perce de points depuis le centre et dévoile la page.
// - Le script inline du <head> pose « intro-en-cours » (à montrer) ou « intro-vue » (déjà vu) sur <html>.
// - Durée : 0,6 s au moins (0,4 s si tout est déjà en cache), 3 s au plus (jamais bloquant),
//   puis 0,8 s de dissolution (sortie plus courte que l'entrée). Ce qui arrive décélère, ce qui part accélère.
// - Interruptible : un clic, une touche, la molette ou le doigt lance aussitôt la dissolution.
// - Couleurs lues dans les variables CSS de _intro.scss (alimentées par _tokens.scss).
// - Pendant l'attente, <main> porte aria-busy (3 s au plus).
// - Au début de la dissolution, l'événement « intro:revele » lance l'entrée du hero (hero_motif_controller.js).
// - Sans JavaScript, le voile se retire seul en CSS au bout de 4 s (_intro.scss).
// - Mouvement réduit : pastille fixe, puis simple fondu.
// Le voile est aria-hidden et laisse passer les clics : le contenu reste accessible pendant l'attente.
const DUREE_MIN = 600
const DUREE_MIN_CACHE = 400 // tout était déjà là : on ne fait pas attendre
const DUREE_MAX = 3000
const DUREE_FIN = 800
const PAS_FIN = 26
const INTERRUPTIONS = ["pointerdown", "keydown", "wheel", "touchstart"]

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const easeOut = (t) => 1 - Math.pow(1 - t, 3) // arrivée : décélère
const easeIn = (t) => t * t                    // départ : accélère

export default class extends Controller {
  static targets = ["canvas"]

  connect() {
    if (!document.documentElement.classList.contains("intro-en-cours")) {
      this.element.remove()
      return
    }
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    this.terminer = this.terminer.bind(this)
    document.addEventListener("turbo:before-cache", this.terminer)

    const style = getComputedStyle(this.element)
    this.couleurs = {
      fond: style.getPropertyValue("--intro-fond").trim(),
      trame: style.getPropertyValue("--intro-trame").trim(),
      encre: style.getPropertyValue("--intro-encre").trim()
    }
    this.main = document.getElementById("contenu")
    this.main?.setAttribute("aria-busy", "true")

    this.interrompre = () => { this.force = true }
    INTERRUPTIONS.forEach((type) => window.addEventListener(type, this.interrompre, { passive: true }))
    this.redimensionner = () => {
      this.dimensionner()
      if (this.pastille) this.pastille = this.construirePastille()
    }
    window.addEventListener("resize", this.redimensionner)

    this.dimensionner()
    this.dessiner(0, 0) // premier fond orange dessiné avant de retirer celui du CSS : aucun trou
    this.element.classList.add("intro--js") // le canvas prend le relais du fond CSS
    this.suivreChargement()
    this.t0 = performance.now()
    this.p = 0
    this.boucle = this.boucle.bind(this)
    this.raf = requestAnimationFrame(this.boucle)
  }

  disconnect() {
    cancelAnimationFrame(this.raf)
    document.removeEventListener("turbo:before-cache", this.terminer)
    this.ecouteursRetires()
  }

  ecouteursRetires() {
    INTERRUPTIONS.forEach((type) => window.removeEventListener(type, this.interrompre))
    window.removeEventListener("resize", this.redimensionner)
  }

  dimensionner() {
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    this.W = window.innerWidth
    this.H = window.innerHeight
    this.canvasTarget.width = this.W * dpr
    this.canvasTarget.height = this.H * dpr
    this.ctx = this.canvasTarget.getContext("2d")
    this.ctx.scale(dpr, dpr)
  }

  // Tâches suivies : les deux polices et, sur la home, la trame du hero (même URL que le masque CSS)
  suivreChargement() {
    const police = document.fonts.load("600 100px ClashDisplay")
    const taches = [police, document.fonts.load('13px "Fragment Mono"')]
    const motif = document.querySelector(".home-hero__motif")
    if (motif) {
      const style = getComputedStyle(motif)
      const masque = style.getPropertyValue("mask-image") || style.getPropertyValue("-webkit-mask-image")
      const url = masque.match(/url\(["']?(.*?)["']?\)/)?.[1]
      if (url) taches.push(new Promise((fin) => {
        const image = new Image()
        image.onload = image.onerror = fin
        image.src = url
      }))
    }
    this.total = taches.length
    this.faites = 0
    taches.forEach((tache) => tache.catch(() => {}).then(() => {
      if (++this.faites === this.total) this.pretA = performance.now() - this.t0
    }))
    // La pastille est dessinée avec ClashDisplay : construite dès que la police est là
    police.catch(() => {}).then(() => { this.pastille = this.construirePastille() })
  }

  // Disque « fh » échantillonné en points : lettres pleines, fond du disque en points légers
  construirePastille() {
    const R = Math.min(this.W, this.H) * 0.2
    const cx = this.W / 2
    const cy = this.H / 2 - 20
    const cote = Math.ceil(R * 2)
    const m = document.createElement("canvas")
    m.width = m.height = cote
    const mx = m.getContext("2d")
    mx.fillStyle = "#555"
    mx.beginPath(); mx.arc(R, R, R, 0, Math.PI * 2); mx.fill()
    mx.save()
    mx.translate(R, R * 1.02)
    mx.rotate(-8 * Math.PI / 180)
    mx.fillStyle = "#000"
    mx.font = `650 ${R * 1.3}px ClashDisplay`
    mx.textAlign = "center"
    mx.textBaseline = "middle"
    mx.fillText("fh", 0, 0)
    mx.restore()
    const d = mx.getImageData(0, 0, cote, cote).data
    const pas = Math.max(5, R / 24)
    const points = []
    for (let y = pas / 2; y < cote; y += pas) {
      for (let x = pas / 2; x < cote; x += pas) {
        const i = ((y | 0) * cote + (x | 0)) * 4
        if (d[i + 3] < 10) continue
        const lettre = d[i] < 60
        points.push({ x: cx - R + x, y: cy - R + y, r: (pas / 2) * (lettre ? 1.08 : 0.42),
                      seuil: Math.hypot(x - R, y - R) / R * 0.55 + Math.random() * 0.15 })
      }
    }
    return { points, R, cx, cy }
  }

  boucle(now) {
    const ecoule = now - this.t0
    if (this.fin === undefined) {
      // Progression affichée : suit les tâches, jamais plus vite que DUREE_MIN, complète à DUREE_MAX
      let cible = ecoule > DUREE_MAX || this.force ? 1 : this.faites / this.total
      const minimum = this.pretA !== undefined && this.pretA < 150 ? DUREE_MIN_CACHE : DUREE_MIN
      if (!this.force) cible = Math.min(cible, ecoule / minimum)
      if (this.force) this.p = Math.max(this.p, 0.99)
      this.p += (cible - this.p) * 0.15
      if (cible === 1 && 1 - this.p < 0.01) {
        this.p = 1
        this.fin = now
        this.reveler()
        if (this.motion) return this.fondu()
      }
    }
    const u = this.fin === undefined ? 0 : clamp((now - this.fin) / DUREE_FIN)
    this.dessiner(this.motion ? 1 : this.p, u)
    if (u < 1) this.raf = requestAnimationFrame(this.boucle)
    else this.terminer()
  }

  dessiner(p, u) {
    const { ctx, W, H } = this
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = this.couleurs.fond
    ctx.fillRect(0, 0, W, H)

    // Dissolution : l'écran se perce de points qui grossissent depuis le centre de la pastille
    if (u > 0) {
      const cx = W / 2
      const cy = H / 2 - 20
      const dmax = Math.hypot(W, H) / 2
      ctx.globalCompositeOperation = "destination-out"
      for (let y = PAS_FIN / 2; y < H + PAS_FIN; y += PAS_FIN) {
        for (let x = PAS_FIN / 2; x < W + PAS_FIN; x += PAS_FIN) {
          const k = easeIn(clamp(u * 1.7 - Math.hypot(x - cx, y - cy) / dmax * 0.7))
          if (k <= 0) continue
          ctx.beginPath(); ctx.arc(x, y, PAS_FIN * 0.75 * k, 0, Math.PI * 2); ctx.fill()
        }
      }
      ctx.globalCompositeOperation = "source-over"
    }

    if (!this.pastille) return
    const retrait = easeIn(clamp(u * 2.5))
    const { points, R, cx, cy } = this.pastille
    ctx.fillStyle = this.couleurs.trame
    for (const pt of points) {
      const k = easeOut(clamp((p - pt.seuil * 0.7) / 0.35)) * (1 - retrait)
      if (k <= 0) continue
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * k, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1 - retrait
    ctx.fillStyle = this.couleurs.encre
    ctx.font = '13px "Fragment Mono"'
    ctx.textAlign = "center"
    ctx.fillText(`${String(Math.round(p * 100)).padStart(3, "0")} %`, cx, cy + R + 40)
    ctx.globalAlpha = 1
  }

  // Mouvement réduit : pastille affichée complète, puis le voile s'efface en fondu
  fondu() {
    this.dessiner(1, 0)
    this.element.style.transition = "opacity 0.3s ease"
    this.element.style.opacity = "0"
    this.timer = setTimeout(this.terminer, 300)
  }

  reveler() {
    if (this.revele) return
    this.revele = true
    window.dispatchEvent(new CustomEvent("intro:revele"))
  }

  // Fin (ou mise en cache Turbo) : la page est libre, l'intro ne revient plus de la session
  terminer() {
    cancelAnimationFrame(this.raf)
    clearTimeout(this.timer)
    this.ecouteursRetires()
    this.main?.removeAttribute("aria-busy")
    this.reveler()
    const html = document.documentElement
    html.classList.remove("intro-en-cours")
    html.classList.add("intro-vue")
    try { sessionStorage.setItem("intro-vue", "1") } catch (e) { /* navigation privée stricte : sans effet */ }
    this.element.remove()
  }
}
