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

/**
 * Le terminal respire : sans cette marge, la sortie et la saisie collent
 * aux bords de ce qui contient le shell.
 */
const baseContainer: CSSProperties = {
	padding: "16px",
}

/** memes polices pour les deux themes : un terminal veut du chasse fixe */
const baseFonts: ShellFonts = {
	shell: "monospace",
	window: "monospace",
}

/** le theme sombre : fond profond, couleurs vives qui ressortent dessus */
export const darkTheme: ShellTheme = {
	colors: {
		background: "#212E35",
		textColor: "#CED4DF",
		importantColor: "#FFCC6A",
		cmdColor: "#c4e98d",
		restrictedColor: "#d15f5f",
		infoColor: "#77CDF1",
		appColor: "#90be20",
		invisible: "#212E35", // = background
	},
	prompt: ">",
	fonts: baseFonts,
	container: baseContainer,
	window: {
		titleBar: "#ed612e",
		border: "#000000",
		content: "#f4ebda",
		text: "#000000",
		button: "lightGray",
		buttonHover: "gray",
	},
}

/**
 * Le theme clair : fond parchemin, memes couleurs assombries pour tenir la
 * lisibilite sur clair (et servir de fond de tag avec un texte blanc).
 */
export const lightTheme: ShellTheme = {
	colors: {
		background: "#F5F1E6",
		textColor: "#2A333A",
		importantColor: "#B26A00",
		cmdColor: "#3F7A1E",
		restrictedColor: "#C0392B",
		infoColor: "#1C7FB8",
		appColor: "#5E8A12",
		invisible: "#F5F1E6", // = background
	},
	prompt: ">",
	fonts: baseFonts,
	container: baseContainer,
	window: {
		titleBar: "#ed612e",
		border: "#3A3A3A",
		content: "#ffffff",
		text: "#000000",
		button: "#dddddd",
		buttonHover: "#bbbbbb",
	},
}

/** le theme par defaut reste le sombre, comme avant */
export const defaultTheme: ShellTheme = darkTheme

/**
 * Le theme vit au niveau du module, comme le registre des commandes : le
 * balisage est rendu par une fonction, pas par un composant, un
 * ThemeProvider ne l'atteindrait pas. Corollaire assume : un shell par page.
 */
let current: ShellTheme = defaultTheme

export const setTheme = (theme?: ShellThemeInput) => {
	if (!theme) return

	current = {
		colors: { ...current.colors, ...theme.colors },
		prompt: theme.prompt || current.prompt,
		fonts: { ...current.fonts, ...theme.fonts },
		window: { ...current.window, ...theme.window },
		container: { ...current.container, ...theme.container },
	}
}

export const theme = () => current

/** raccourci de lecture, le plus frequent dans les styles */
export const colors = (): ShellColors => current.colors

export const windowColors = (): WindowColors => current.window

export const fonts = (): ShellFonts => current.fonts

/** le style pose sur le conteneur general du terminal */
export const container = (): CSSProperties => current.container

export type { CSSProperties }
