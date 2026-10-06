# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "@popperjs/core", to: "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/esm/index.js"
pin "bootstrap", to: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.esm.min.js"
pin "gsap", integrity: "sha384-DgF4In2Ku/WKPAnGP7CmINoTmkbM9Bht3/Xaz0vQGEEsZPxz7qTpfCb57+bA4Hmf" # @3.15.0
pin "lenis", integrity: "sha384-LaovmBx3lRd1+uj03+JrYM369Teo/TgVkyBBOKYWQ9FQBSGKhvlMfvSmYSux9r4B" # @1.3.26
pin "gsap/ScrollTrigger", to: "gsap--ScrollTrigger.js", integrity: "sha384-GZoB/K/BR+wjA8peyjdTLfwHc3pgLvyN1TMMYOtUHzTYaykaXDVjto67gTRdEgCC" # @3.15.0
pin "gsap/SplitText", to: "gsap--SplitText.js", integrity: "sha384-tn0TxpAnM42A8faSAYphAWk3AK3Q8H3Jq9oPO7fJD1UkchogWcGEXQ1N6syE7+b0" # @3.15.0
