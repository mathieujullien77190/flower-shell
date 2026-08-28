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
}

export const defaultTheme: ShellTheme = {
	colors: {
		background: "#212E35",
		textColor: "#CED4DF",
		importantColor: "#FFCC6A",
		cmdColor: "#c4e98d",
		restrictedColor: "#d15f5f",
		infoColor: "#77CDF1",
		appColor: "#90be20",
	},
	prompt: ">",
	fonts: {
		shell: "monospace",
		window: "monospace",
	},
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
	}
}

export const theme = () => current

/** raccourci de lecture, le plus frequent dans les styles */
export const colors = (): ShellColors => current.colors

export const windowColors = (): WindowColors => current.window

export const fonts = (): ShellFonts => current.fonts

export type { CSSProperties }
