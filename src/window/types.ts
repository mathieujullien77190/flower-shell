import { ReactNode, RefObject } from "react"

export type Pos = { x: number; y: number }
export type Mode = "medium" | "full"

/**
 * Le coin du bureau ou la fenetre s'ouvre : l'horizontale, puis la
 * verticale. `center-center` est la place par defaut, celle qu'elle a
 * toujours eue.
 */
export type WindowStart =
	| "left-top"
	| "center-top"
	| "right-top"
	| "left-center"
	| "center-center"
	| "right-center"
	| "left-bottom"
	| "center-bottom"
	| "right-bottom"

export type WindowProps = {
	show: boolean
	container: RefObject<HTMLDivElement>
	title?: string
	/** marque de la barre de titre, visee par la visite guidee */
	tutorial?: string
	/** marque du cadre entier, pour poser un calque par-dessus */
	mark?: string
	/** etage d'empilement : la fenetre au premier plan a le plus grand */
	layer?: number
	/** rang dans la cascade, pour ne pas s'ouvrir sur la precedente */
	rank?: number
	/**
	 * Hauteur reservee en bas du conteneur, en CSS. Le bureau y met sa
	 * barre des taches ; sans elle, la fenetre passerait dessous.
	 */
	bottomInset?: string
	/**
	 * Pleine et non redimensionnable. A qui l'affiche de decider quand :
	 * un petit ecran, un mode lecture, une preference. Le paquet ne fixe
	 * aucun seuil.
	 */
	compact?: boolean
	/** elle se deplace a la souris par sa barre de titre ; vrai par defaut */
	move?: boolean
	/** le coin ou elle s'ouvre ; `center-center` par defaut */
	start?: WindowStart
	/**
	 * La distance au bord, en CSS : `"24px"`, `"2rem"`, `"3%"`. Elle ecarte
	 * la fenetre du bord dont `start` la rapproche, et ne s'applique donc
	 * pas aux axes centres, ni a la fenetre pleine. Zero par defaut.
	 */
	margin?: string
	/**
	 * Le bouton d'agrandissement, et le double-clic sur la barre. Faux le
	 * retire et la fenetre garde son gabarit. `compact` l'emporte : pleine,
	 * elle n'a plus rien a agrandir.
	 */
	canExpand?: boolean
	/** la croix de fermeture ; vrai par defaut */
	canClose?: boolean
	/**
	 * Elle ne ferme pas d'elle-meme : la croix previent, et c'est `show`
	 * qui la fait disparaitre. A qui l'affiche de le passer a faux.
	 */
	onClose?: () => void
	/** la fenetre reclame le premier plan */
	onFocus?: () => void
	children: ReactNode
}
