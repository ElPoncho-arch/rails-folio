# Pin npm packages by running ./bin/importmap

pin "application", to: "application.js", preload: true
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "stimulus", to: "@hotwired/stimulus", preload: true
pin "@hotwired/stimulus",      to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "intl-tel-input", to: "https://cdn.jsdelivr.net/npm/intl-tel-input@17.0.8/build/js/intlTelInput.min.js", preload: true
pin "@popperjs/core", to: "https://ga.jspm.io/npm:@popperjs/core@2.11.7/lib/index.js"
pin "bootstrap",         to: "https://ga.jspm.io/npm:bootstrap@5.2.3/dist/js/bootstrap.esm.js"
