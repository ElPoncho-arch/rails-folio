import "./page_transitions"
import "@hotwired/turbo-rails"
import "controllers"
import "bootstrap"
import "@popperjs/core"

const emojiFlag = iso2 =>
  iso2
    .toUpperCase()
    .split("")
    .map(c => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("")

document.addEventListener("turbo:load", () => {
  const input  = document.querySelector("#contact_phone")
  const select = document.querySelector("#contact_country_code")

  // 1) Remplir le select avec tous les pays + indicatifs + drapeaux emoji
  if (select && window.intlTelInputGlobals) {
    select.innerHTML = "<option value=''>Select country code</option>"
    window.intlTelInputGlobals.getCountryData().forEach(country => {
      const opt = document.createElement("option")
      opt.value = `+${country.dialCode}`
      // on inclut désormais le nom du pays
      opt.text = `${emojiFlag(country.iso2)} ${country.name} (+${country.dialCode})`
      select.appendChild(opt)
    })
  }

  // 2) Initialiser intl-tel-input sur l'input (formatage)
  if (input && window.intlTelInput) {
    const iti = window.intlTelInput(input, {
      initialCountry: "auto",
      geoIpLookup: cb =>
        fetch("https://ipapi.co/json")
          .then(r => r.json()).then(d => cb(d.country_code))
          .catch(() => cb("us")),
      utilsScript:
        "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.8/build/js/utils.js"
    })

    // 3) Synchroniser select ← input
    input.addEventListener("countrychange", () => {
      const d = iti.getSelectedCountryData()
      if (select) select.value = "+" + d.dialCode
    })

    // 4) Synchroniser input ← select
    if (select) {
      select.addEventListener("change", () => {
        iti.setCountry(select.value.replace("+", ""))
      })
    }
  }
})

// on récupère notre overlay
const loader = document.getElementById("page-loader")
if (!loader) console.warn("🚨 #page-loader introuvable !")

// helper
const show = () => loader && (loader.style.display = "flex")
const hide = () => loader && (loader.style.display = "none")

// debug
console.log("🚀 application.js chargé, #page-loader =", loader)
console.log("✅ application.js chargé");

// 1) sur le premier chargement
window.addEventListener("DOMContentLoaded", () => {
  console.log("🔹 DOMContentLoaded – on masque le loader")
  hide()
})

// 2) quand Turbo envoie la requête XHR
document.addEventListener("turbo:before-fetch-request", () => {
  console.log("🔸 turbo:before-fetch-request – on affiche le loader")
  show()
})

// 3) quand la page vient d’être rendue par Turbo
document.addEventListener("turbo:load", () => {
  console.log("🔹 turbo:load – on masque le loader")
  hide()
})

// 4) fallback / liens non-Turbo (optionnel)
document.addEventListener("click", e => {
  const a = e.target.closest("a[href]")
  if (!a || a.target === "_blank" || a.href.startsWith("http")) return
  console.log("🔸 clic lien interne – on affiche le loader")
  show()
})

// 5) fallback navigateur (reload, back/forward)
window.addEventListener("beforeunload", () => show())
