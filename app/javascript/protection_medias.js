// Dissuasion légère : pas de clic droit ni de glisser-déposer sur les images et vidéos.
// Le reste de la page garde son comportement normal. Les URL restent accessibles :
// ce n'est pas une protection, seulement un frein.
const MEDIAS = "img, video, picture"

for (const evenement of ["contextmenu", "dragstart"]) {
  document.addEventListener(evenement, (event) => {
    if (event.target.closest?.(MEDIAS)) event.preventDefault()
  })
}
