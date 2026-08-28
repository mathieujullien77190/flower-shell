import { ReactNode, RefObject } from "react"

export type Pos = { x: number; y: number }
export type Mode = "medium" | "full" | "close"

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
	/** la fenetre reclame le premier plan */
	onFocus?: () => void
	children: ReactNode
	onClose?: () => void
}
