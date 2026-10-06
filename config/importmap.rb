# Pin npm packages by running ./bin/importmap

pin "application"
pin "protection_medias"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "@popperjs/core", to: "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/esm/index.js"
pin "bootstrap", to: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.esm.min.js"
pin "lenis" # @1.3.26
pin "gsap" # @3.15.0
pin "gsap/ScrollTrigger", to: "gsap--scroll-trigger.js"
pin "gsap/SplitText", to: "gsap--split-text.js"
