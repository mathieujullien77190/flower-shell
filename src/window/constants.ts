export const FULL = {
	padding: "4px",
	borderSize: "2px",
	fontWeight: "bold",
}

export const LIGHT = {
	padding: "2px",
	borderSize: "1px",
	fontWeight: "normal",
}

export const ANIM_TIME = 300

// gabarit de la fenetre moyenne, en pourcentage du bureau : le poser en
// CSS evite de mesurer le bureau, et la fenetre suit le redimensionnement
export const MEDIUM_MARGIN = 15
export const MEDIUM_SIZE = 70

// decalage d'une fenetre a l'autre a l'ouverture, en pixels : sans lui
// elles se posent au meme endroit et se masquent parfaitement
export const CASCADE = 26

// etage de la fenetre au premier plan ; les autres descendent d'un cran
// et restent sous les modales, qui sont a 10
export const TOP_LAYER = 9
