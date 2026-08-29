import { CSSProperties } from "react"

export type ShellColors = {
	background: string
	textColor: string
	/** ce qui compte dans un texte */
	importantColor: string
	/** le nom d'une commande jouee */
	cmdColor: string
	/** le nom d'une commande restreinte */
	restrictedColor: string
	infoColor: string
	appColor: string
	/** la couleur du fond : un texte pose dessus reste invisible */
	invisible: string
}

/**
 * Les polices. Celle du shell habille la sortie et la saisie, celle de la
 * fenetre sa barre de titre. Elles sont separees : un terminal veut du
 * chasse fixe, un cadre pas forcement.
 */
export type ShellFonts = {
	shell: string
	window: string
}

/** le cadre de la fenetre : barre de titre, bordure, boutons */
export type WindowColors = {
	titleBar: string
	border: string
	/** le fond derriere le contenu, visible autour de lui */
	content: string
	text: string
	button: string
	buttonHover: string
}

export type ShellTheme = {
	colors: ShellColors
	/** l'invite, posee devant la saisie et devant chaque commande */
	prompt: string
	fonts: ShellFonts
	window: WindowColors
	/**
	 * Le style du conteneur general du terminal, pose en inline sur lui.
	 * Ouvert a tout CSSProperties et pas au seul padding : la marge
	 * interieure est le besoin courant, mais un arrondi, une bordure ou une
	 * ombre se posent au meme endroit. Recouvre le style de base du
	 * conteneur, propriete par propriete.
	 */
	container: CSSProperties
}

/**
 * Ce qu'un consommateur a le droit de donner : tout est optionnel, y
 * compris dans les sous-objets. Un Partial<ShellTheme> ne suffirait pas,
 * il exigerait les groupes de couleurs au complet.
 */
export type ShellThemeInput = {
	colors?: Partial<ShellColors>
	prompt?: string
	fonts?: Partial<ShellFonts>
	window?: Partial<WindowColors>
	container?: CSSProperties
}
