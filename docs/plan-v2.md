# Plan V2 — rails-folio

Branche `v2-front` (V1 taguée `v1.0`). On refait le front, on garde les projets.
Une étape = un commit.

- [x] 1. Tokens SCSS
- [x] 2. Typos (ClashDisplay + Fragment Mono auto-hébergées, pas de Google Fonts)
- [x] 3. Purge des anciennes couleurs (#171717, #ffff00)
- [x] 4. Layout (nav pilule, footer, Lenis, transitions)
- [x] 5. Home (la liste des projets y passe en #projets ; /work → 301 vers /#projets)
- [x] 6. Page projet (partial commun)
- [x] 7. Migration des images locales vers Cloudinary
  - à vérifier : public_id `PERSO_BALLON_y1jedw`, cité seulement dans l'ancien script de la page TF1 (supprimé à l'étape 6)
- [x] 8. About + Contact (extraire les styles du formulaire dans _contact.scss)
- [ ] 9. Mentions légales
- [ ] 10. Animations (controllers Stimulus)
- [ ] 11. Recette mobile + accessibilité
  - revue complète du front avec Fabien, mobile first en priorité (375 px, puis tablette, puis desktop), avant tout déploiement
  - configurer l'envoi de mail en production sur Heroku (SMTP, variables d'environnement)
