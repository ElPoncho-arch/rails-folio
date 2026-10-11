import { Controller } from "@hotwired/stimulus"

// Panier CV (page À propos) : on attrape l'icône PDF, on tire vers le bas (lance-pierre),
// on vise le panier. Un panier marqué télécharge le CV en cliquant sur le lien « télécharger le CV ».
// - Dessin sur canvas dans un plan logique 640 × 700, monde 3D projeté (caméra au-dessus de l'arceau).
// - Saisie uniquement par la poignée posée sur l'icône : le reste du terrain laisse défiler la page au doigt.
// - Coup de pouce : après deux ratés, la trajectoire de visée s'allonge.
// - Démo : à chaque arrivée sur la page, quand le terrain est bien visible, un doigt fantôme
//   fait un lancer réussi (sans téléchargement ni point). Attraper l'icône l'interrompt.
// - Boucle active seulement si le terrain est à l'écran et l'onglet affiché.
// - Mouvement réduit : rien ne démarre (terrain masqué en CSS), le lien suffit.

// ---------- Plan écran logique et monde 3D ----------
const W = 640, H = 700
const C = { creme: "#F6F1E7", encre: "#1C1A17", tomate: "#EF8862", peche: "#FFD8C2", carte: "#FBF8F2" }
const F = 600                // focale
const CX = W / 2, CY = 100   // horizon
const CAM_Y = 600            // caméra au-dessus de l'arceau : on voit dans le panier
const G = 1800               // gravité

const HOOP = { z: 650, y: 267, r: 120 }
const PANNEAU = { z: HOOP.z + HOOP.r + 20, x1: -230, x2: 230, y1: HOOP.y - 30, y2: HOOP.y + 250 }
const FILET_H = 150, BALLE_R = 26, TUBE = 7

// Départ : l'icône dans la carte (écran 86, 612 → monde à z = 0)
const DEP_ECRAN = { x: 86, y: 612 }
const DEP = { x: DEP_ECRAN.x - CX, y: CAM_Y - (DEP_ECRAN.y - CY), z: 0 }

const MAX_TIRE = 200, KA = 1636, KB = 1023, KX = 2.6

// Course du tirage à l'écran (px CSS) pour atteindre MAX_TIRE : l'icône est en bas du terrain,
// il reste peu de place avant le bord de la fenêtre. Le tirage est ramené au plan logique,
// les trajectoires ne changent pas, seule la distance à parcourir raccourcit.
const COURSE_SOURIS = 80
const COURSE_TACTILE = 70

// Démo : tir au centre de la zone qui marque (réussi à 30, 60 et 120 images/s, voisins compris)
const DEMO = { tire: { dx: -84, dy: 142 }, attente: 600, pose: 0.45, tirage: 1, tenue: 0.35 }

const POLICE = '"Fragment Mono", monospace'

const proj = (x, y, z) => {
  const s = F / (F + z)
  return { x: CX + x * s, y: CY - (y - CAM_Y) * s, s }
}

// Points de collision de l'arceau
const ANNEAU = Array.from({ length: 24 }, (_, i) => {
  const t = i / 24 * Math.PI * 2
  return { x: Math.cos(t) * HOOP.r, z: HOOP.z + Math.sin(t) * HOOP.r }
})

export default class extends Controller {
  static targets = ["terrain", "canvas", "poignee", "carte", "etat", "jauge", "score", "lien"]

  connect() {
    this.motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    this.onMotionChange = () => (this.motion.matches ? this.arreter() : this.demarrer())
    this.motion.addEventListener("change", this.onMotionChange)

    if (!this.motion.matches) this.demarrer()
  }

  disconnect() {
    this.motion.removeEventListener("change", this.onMotionChange)
    this.arreter()
  }

  // Clic direct sur le lien (ou clic déclenché par un panier) : la carte passe en « téléchargé »,
  // sans empêcher le téléchargement.
  telecharger() {
    this.carteTelechargee()
  }

  // ---------- Mise en route et arrêt ----------
  demarrer() {
    if (this.actif) return
    this.actif = true

    // Références gardées : à la déconnexion (changement de page Turbo), les cibles ne sont plus trouvables
    this.poignee = this.poigneeTarget
    this.canvas = this.canvasTarget
    this.ctx = this.canvas.getContext("2d")
    this.echelle = 1
    this.dpr = 1
    this.b = {}
    this.tire = { dx: 0, dy: 0 }
    this.prise = null
    this.paniers = Number(this.scoreTarget.textContent) || 0
    this.rates = 0
    this.filet = 0
    this.confettis = []
    this.replacer()

    this.onDown = this.saisir.bind(this)
    this.onMove = this.viser.bind(this)
    this.onUp = this.lacher.bind(this)
    this.poignee.addEventListener("pointerdown", this.onDown)
    this.poignee.addEventListener("pointermove", this.onMove)
    this.poignee.addEventListener("pointerup", this.onUp)
    this.poignee.addEventListener("pointercancel", this.onUp)

    this.boucle = this.image.bind(this)
    this.visible = false
    this.onVisibilite = () => this.majBoucle()
    document.addEventListener("visibilitychange", this.onVisibilite)

    this.resizeObserver = new ResizeObserver(() => this.redim())
    this.resizeObserver.observe(this.terrainTarget)
    this.demo = null
    this.demoJouee = false
    this.intersectionObserver = new IntersectionObserver(([entree]) => {
      this.visible = entree.isIntersecting
      if (entree.intersectionRatio >= 0.6) this.planifierDemo()
      this.majBoucle()
    }, { threshold: [0, 0.6] })
    this.intersectionObserver.observe(this.terrainTarget)

    this.redim()
  }

  arreter() {
    if (!this.actif) return
    this.actif = false

    if (this.raf) cancelAnimationFrame(this.raf)
    this.raf = null
    clearTimeout(this.minuterieDemo)
    this.demo = null
    this.resizeObserver.disconnect()
    this.intersectionObserver.disconnect()
    document.removeEventListener("visibilitychange", this.onVisibilite)
    this.poignee.removeEventListener("pointerdown", this.onDown)
    this.poignee.removeEventListener("pointermove", this.onMove)
    this.poignee.removeEventListener("pointerup", this.onUp)
    this.poignee.removeEventListener("pointercancel", this.onUp)
    this.poignee.classList.remove("is-prise")
    this.confettis = []
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  // Boucle seulement si le terrain est visible et l'onglet affiché
  majBoucle() {
    const doitTourner = this.actif && this.visible && !document.hidden
    if (doitTourner && !this.raf) {
      this.dernier = performance.now()
      this.raf = requestAnimationFrame(this.boucle)
    } else if (!doitTourner && this.raf) {
      cancelAnimationFrame(this.raf)
      this.raf = null
    }
  }

  redim() {
    const terrain = this.terrainTarget
    this.dpr = Math.min(2, window.devicePixelRatio || 1)
    this.canvas.width = Math.round(terrain.clientWidth * this.dpr)
    this.canvas.height = Math.round(terrain.clientHeight * this.dpr)
    this.echelle = terrain.clientWidth / W || 1
  }

  // ---------- État ----------
  dire(texte) {
    this.etatTarget.textContent = texte
  }

  replacer() {
    Object.assign(this.b, { x: DEP.x, y: DEP.y, z: 0, vx: 0, vy: 0, vz: 0, a: 0, va: 0 })
    this.etat = "repos" // repos | vise | vol
    this.aMarque = false
    this.tVol = 0
  }

  carteTelechargee() {
    this.carteTarget.classList.add("is-ok")
    this.jaugeTarget.style.width = "100%"
    this.dire("téléchargé ✓")
  }

  // ---------- Démo ----------
  // Une fois par affichage de la page, peu après que le terrain est visible aux deux tiers
  planifierDemo() {
    if (this.demoJouee) return
    this.demoJouee = true
    this.minuterieDemo = setTimeout(() => {
      if (!this.actif || this.etat !== "repos") return // le visiteur joue déjà
      this.demo = { t: 0, lancee: false }
      this.etat = "vise"
      this.tire = { dx: 0, dy: 0 }
      this.dire("regardez…")
    }, DEMO.attente)
  }

  // Le doigt se pose, tire doucement vers le bas, marque un temps, puis lâche
  avancerDemo(dt) {
    const d = this.demo
    d.t += dt
    if (d.lancee) return
    const k = Math.min(1, Math.max(0, (d.t - DEMO.pose) / DEMO.tirage))
    const doux = 1 - Math.pow(1 - k, 3)
    this.tire = { dx: DEMO.tire.dx * doux, dy: DEMO.tire.dy * doux }
    if (d.t >= DEMO.pose + DEMO.tirage + DEMO.tenue) {
      d.lancee = true
      this.lancer()
    }
  }

  finirDemo() {
    this.demo = null
    this.dire("à vous !")
  }

  // ---------- Saisie (poignée seulement) ----------
  saisir(e) {
    if (this.demo) { // le visiteur prend la main : la démo s'arrête net
      this.demo = null
      this.replacer()
    }
    if (this.etat !== "repos") return
    e.preventDefault()
    this.etat = "vise"
    this.prise = { x: e.clientX, y: e.clientY }
    this.course = e.pointerType === "touch" ? COURSE_TACTILE : COURSE_SOURIS
    this.tire = { dx: 0, dy: 0 }
    this.poignee.setPointerCapture(e.pointerId)
    this.poignee.classList.add("is-prise")
    this.dire("visez… et lâchez")
  }

  viser(e) {
    if (this.etat !== "vise") return
    const k = MAX_TIRE / this.course // px d'écran → plan logique
    let dx = (e.clientX - this.prise.x) * k, dy = (e.clientY - this.prise.y) * k
    const d = Math.hypot(dx, dy)
    if (d > MAX_TIRE) { dx *= MAX_TIRE / d; dy *= MAX_TIRE / d }
    this.tire = { dx, dy }
  }

  lacher() {
    if (this.etat !== "vise") return
    this.poignee.classList.remove("is-prise")
    const v = this.vitesse()
    if (!v) {
      this.replacer()
      this.dire("tirez vers le bas pour lancer")
      return
    }
    this.lancer()
    this.dire("en vol…")
  }

  lancer() {
    const v = this.vitesse()
    Object.assign(this.b, { x: DEP.x, y: DEP.y, z: 0, ...v, va: v.vx / 60 + 4 })
    this.etat = "vol"
  }

  // Tirer vers le bas = puissance ; tirer à gauche = partir à droite (lance-pierre)
  vitesse() {
    const p = Math.max(0, this.tire.dy) / MAX_TIRE
    if (p < 0.12) return null
    return { vx: -this.tire.dx * KX, vy: KA * p, vz: KB * p }
  }

  // ---------- Physique ----------
  pas(dt) {
    const b = this.b
    const yAvant = b.y
    b.vy -= G * dt
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt; b.a += b.va * dt

    // Rebond sur l'arceau
    for (const q of ANNEAU) {
      const dx = b.x - q.x, dy = b.y - HOOP.y, dz = b.z - q.z
      const d = Math.hypot(dx, dy, dz), min = BALLE_R + TUBE
      if (d < min && d > 0) {
        const nx = dx / d, ny = dy / d, nz = dz / d
        b.x = q.x + nx * min; b.y = HOOP.y + ny * min; b.z = q.z + nz * min
        const vn = b.vx * nx + b.vy * ny + b.vz * nz
        if (vn < 0) {
          const k = 1.5 * vn
          b.vx -= k * nx; b.vy -= k * ny; b.vz -= k * nz; b.va = -b.va * 0.7
        }
      }
    }

    // Rebond sur le panneau
    if (b.vz > 0 && b.z + BALLE_R > PANNEAU.z && b.z < PANNEAU.z + 20 &&
        b.x > PANNEAU.x1 && b.x < PANNEAU.x2 && b.y > PANNEAU.y1 && b.y < PANNEAU.y2) {
      b.z = PANNEAU.z - BALLE_R; b.vz *= -0.5; b.vx *= 0.8
    }

    // Panier : passe l'arceau en descendant, assez près du centre (une seule fois par lancer)
    if (!this.aMarque && yAvant > HOOP.y && b.y <= HOOP.y && b.vy < 0 &&
        Math.hypot(b.x, b.z - HOOP.z) < HOOP.r - BALLE_R * 0.5) {
      this.aMarque = true
      this.marquer()
    }

    // Dans le filet : freiné et recentré
    if (this.aMarque && b.y < HOOP.y && b.y > HOOP.y - FILET_H) {
      b.vx *= 0.9; b.vz *= 0.9
      b.x += (0 - b.x) * 0.08; b.z += (HOOP.z - b.z) * 0.08
    }
  }

  marquer() {
    this.filet = 1
    if (!this.demo) {
      this.paniers++
      this.rates = 0
      this.scoreTarget.textContent = this.paniers
    }

    const c = proj(0, HOOP.y, HOOP.z)
    for (let i = 0; i < 40; i++) {
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.4, v = 260 + Math.random() * 380
      this.confettis.push({
        x: c.x, y: c.y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v,
        a: Math.random() * 6, va: (Math.random() - 0.5) * 14, vie: 1.5,
        c: [C.tomate, C.encre, C.peche][i % 3]
      })
    }

    // Même origine : l'attribut download du lien s'applique. Le clic passe aussi par telecharger().
    if (!this.demo) this.lienTarget.click()
  }

  // ---------- Boucle ----------
  image(now) {
    this.raf = requestAnimationFrame(this.boucle)
    const dt = Math.min(1 / 30, (now - this.dernier) / 1000)
    this.dernier = now
    const b = this.b

    if (this.demo) this.avancerDemo(dt)

    if (this.etat === "vol") {
      for (let i = 0; i < 5; i++) this.pas(dt / 5)
      this.tVol += dt
      const q = proj(b.x, b.y, b.z)
      if (q.y > H + 60 || b.y < -400 || this.tVol > 4) {
        if (this.demo) {
          this.finirDemo()
        } else if (!this.aMarque) {
          this.rates++
          this.dire(this.rates >= 2 ? "raté · aide activée" : "raté, encore !")
        }
        this.replacer()
      }
    }

    const ctx = this.ctx
    ctx.setTransform(this.dpr * this.echelle, 0, 0, this.dpr * this.echelle, 0, 0)
    ctx.clearRect(0, 0, W, H)

    this.dessinerCadre()
    this.dessinerPanneau()

    const enMain = this.etat === "repos" || this.etat === "vise"
    const vise = this.etat === "vise"
    const q = enMain
      ? { x: DEP_ECRAN.x + (vise ? this.tire.dx * 0.35 : 0), y: DEP_ECRAN.y + (vise ? this.tire.dy * 0.35 : 0), s: 1 }
      : proj(b.x, b.y, b.z)
    const derriere = this.etat === "vol" && b.z > HOOP.z + HOOP.r * 0.2
    const dedans = this.etat === "vol" && b.y < HOOP.y + 10 && Math.hypot(b.x, b.z - HOOP.z) < HOOP.r

    // Ordre de dessin : ce qui est derrière l'arceau, l'arceau arrière, le filet, l'arceau avant, le reste
    if (derriere) this.dessinerFichier(q.x, q.y, b.a, q.s)
    this.dessinerArceau("arriere")
    if (dedans && !derriere) this.dessinerFichier(q.x, q.y, b.a, q.s)
    this.dessinerFilet(dt)
    this.dessinerArceau("avant")
    if (this.etat === "vol") this.dessinerEmplacement()
    if (vise) this.dessinerTrajectoire()
    if (!derriere && !dedans) this.dessinerFichier(q.x, q.y, vise ? this.tire.dx * 0.002 : b.a, q.s)
    if (this.demo && !this.demo.lancee) this.dessinerDoigt()

    this.dessinerConfettis(dt)
  }

  // ---------- Dessin ----------
  dessinerFichier(x, y, a, s) {
    const ctx = this.ctx
    const w = 44, h = 56, pli = 14
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s)
    ctx.beginPath()
    ctx.moveTo(-w / 2 + 6, -h / 2); ctx.lineTo(w / 2 - pli, -h / 2); ctx.lineTo(w / 2, -h / 2 + pli)
    ctx.lineTo(w / 2, h / 2 - 6); ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - 6, h / 2)
    ctx.lineTo(-w / 2 + 6, h / 2); ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - 6)
    ctx.lineTo(-w / 2, -h / 2 + 6); ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + 6, -h / 2); ctx.closePath()
    ctx.fillStyle = C.creme; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.encre; ctx.stroke()
    ctx.beginPath(); ctx.moveTo(w / 2 - pli, -h / 2); ctx.lineTo(w / 2 - pli, -h / 2 + pli); ctx.lineTo(w / 2, -h / 2 + pli); ctx.stroke()
    ctx.fillStyle = C.tomate; ctx.fillRect(-w / 2 - 6, 2, w - 4, 18)
    ctx.fillStyle = C.encre; ctx.font = `13px ${POLICE}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"
    ctx.fillText("PDF", -6, 12)
    ctx.fillRect(-14, -14, 20, 3); ctx.fillRect(-14, -7, 14, 3)
    ctx.restore()
  }

  // Doigt fantôme de la démo : pastille qui se pose (léger rebond) puis suit le tirage
  dessinerDoigt() {
    const ctx = this.ctx
    const k = Math.min(1, this.demo.t / DEMO.pose)
    const rebond = 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2) // back.out
    const x = DEP_ECRAN.x + this.tire.dx * 0.55, y = DEP_ECRAN.y + this.tire.dy * 0.55
    ctx.save(); ctx.translate(x, y); ctx.scale(rebond, rebond)
    ctx.globalAlpha = k
    ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(28,26,23,.18)"; ctx.fill()
    ctx.lineWidth = 2.5; ctx.strokeStyle = C.encre; ctx.stroke()
    ctx.restore()
    ctx.globalAlpha = 1
  }

  // Cadre pointillé « zone de tir » autour du panneau
  dessinerCadre() {
    const ctx = this.ctx
    const a = proj(PANNEAU.x1, PANNEAU.y2, PANNEAU.z), z = proj(PANNEAU.x2, HOOP.y - FILET_H, HOOP.z - HOOP.r)
    const x1 = a.x - 70, y1 = a.y - 30, x2 = z.x + 70, y2 = z.y + 30
    ctx.setLineDash([8, 8]); ctx.lineWidth = 1.5; ctx.strokeStyle = "rgba(28,26,23,.35)"
    ctx.beginPath(); ctx.roundRect(x1, y1, x2 - x1, y2 - y1, 18); ctx.stroke(); ctx.setLineDash([])
    ctx.fillStyle = "rgba(28,26,23,.5)"; ctx.font = `12px ${POLICE}`; ctx.textAlign = "left"; ctx.textBaseline = "top"
    ctx.fillText("zone de tir", x1 + 14, y1 + 12)
  }

  dessinerPanneau() {
    const ctx = this.ctx
    const p = (x, y) => proj(x, y, PANNEAU.z)
    const quad = (xa, xb, ya, yb) => {
      const q = [p(xa, ya), p(xb, ya), p(xb, yb), p(xa, yb)]
      ctx.beginPath(); q.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y))); ctx.closePath()
    }
    quad(PANNEAU.x1, PANNEAU.x2, PANNEAU.y1, PANNEAU.y2)
    ctx.fillStyle = C.carte; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.encre; ctx.stroke()
    quad(-80, 80, HOOP.y + 20, HOOP.y + 130)
    ctx.lineWidth = 3; ctx.strokeStyle = C.tomate; ctx.stroke()
    // Support de l'arceau
    const s1 = proj(-18, HOOP.y, PANNEAU.z), s2 = proj(18, HOOP.y - 14, HOOP.z + HOOP.r)
    ctx.fillStyle = C.encre
    ctx.fillRect(s1.x, Math.min(s1.y, s2.y) - 2, s2.x - s1.x, Math.abs(s2.y - s1.y) + 6)
  }

  dessinerArceau(moitie) {
    const ctx = this.ctx
    ctx.strokeStyle = C.tomate; ctx.lineWidth = 6 * proj(0, 0, HOOP.z).s * 2; ctx.lineCap = "round"
    ctx.beginPath()
    const n = 48
    for (let i = 0; i <= n / 2; i++) {
      const t = (moitie === "arriere" ? 0 : Math.PI) + i / n * Math.PI * 2
      const q = proj(Math.cos(t) * HOOP.r, HOOP.y, HOOP.z + Math.sin(t) * HOOP.r)
      i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)
    }
    ctx.stroke(); ctx.lineCap = "butt"
  }

  // Filet : ondule et s'étire un instant après un panier
  dessinerFilet(dt) {
    const ctx = this.ctx
    this.filet = Math.max(0, this.filet - dt * 1.4)
    const ond = Math.sin(performance.now() / 45) * 10 * this.filet, etire = 1 + 0.25 * this.filet
    ctx.strokeStyle = C.encre; ctx.lineWidth = 1.5
    const n = 14, bas = HOOP.y - FILET_H * etire, rb = HOOP.r * 0.6
    const haut = [], pied = []
    for (let i = 0; i < n; i++) {
      const t = i / n * Math.PI * 2
      haut.push(proj(Math.cos(t) * HOOP.r, HOOP.y, HOOP.z + Math.sin(t) * HOOP.r))
      pied.push(proj(Math.cos(t + 0.35) * rb + ond, bas, HOOP.z + Math.sin(t + 0.35) * rb))
    }
    for (let i = 0; i < n; i++) {
      ctx.beginPath(); ctx.moveTo(haut[i].x, haut[i].y); ctx.lineTo(pied[i].x, pied[i].y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(haut[(i + 1) % n].x, haut[(i + 1) % n].y); ctx.lineTo(pied[i].x, pied[i].y); ctx.stroke()
    }
    ctx.beginPath(); pied.forEach((v, i) => (i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y))); ctx.closePath(); ctx.stroke()
  }

  // Emplacement vide de l'icône pendant le vol
  dessinerEmplacement() {
    const ctx = this.ctx
    ctx.setLineDash([4, 4]); ctx.strokeStyle = "rgba(28,26,23,.3)"; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.roundRect(DEP_ECRAN.x - 22, DEP_ECRAN.y - 28, 44, 56, 6); ctx.stroke(); ctx.setLineDash([])
  }

  // Pointillés de visée ; coup de pouce après deux ratés : trajectoire complète
  dessinerTrajectoire() {
    const v = this.vitesse()
    if (!v) return
    const ctx = this.ctx
    const pts = this.rates >= 2 ? 70 : 16
    let x = DEP.x, y = DEP.y, z = 0, vy = v.vy
    const dt = 1 / 40
    for (let i = 0; i < pts; i++) {
      vy -= G * dt; x += v.vx * dt; y += vy * dt; z += v.vz * dt
      if (i % 2) continue
      const q = proj(x, y, z)
      ctx.globalAlpha = 1 - i / pts * 0.75; ctx.fillStyle = C.encre
      ctx.beginPath(); ctx.arc(q.x, q.y, Math.max(1.5, 5 * q.s), 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  dessinerConfettis(dt) {
    const ctx = this.ctx
    this.confettis = this.confettis.filter((c) => (c.vie -= dt) > 0)
    this.confettis.forEach((c) => {
      c.vy += G * 0.5 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.a += c.va * dt
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a); ctx.globalAlpha = Math.min(1, c.vie)
      ctx.fillStyle = c.c; ctx.fillRect(-6, -3, 12, 6); ctx.restore()
    })
    ctx.globalAlpha = 1
  }
}
