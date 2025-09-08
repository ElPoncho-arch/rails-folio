// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "./page_transitions"
import "@hotwired/turbo-rails"
import "controllers"       // doit importer index.js
import "bootstrap"              // charge Bootstrap JS
import "@popperjs/core"         // ou inclus automatiquement par bootstrap

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
