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

/** memes polices pour tous les themes : un terminal veut du chasse fixe */
const baseFonts: ShellFonts = {
	shell: "monospace",
	window: "monospace",
}

/**
 * Un theme se resume a sa palette. Le reste ne varie pas — memes polices,
 * meme marge — et le cadre de fenetre tient en deux couleurs. Ecrire les
 * huit themes au complet aurait recopie la meme trentaine de lignes.
 */
const makeTheme = ({
	colors,
	prompt = ">",
	titleBar,
	content,
	border = "#000000",
	button = "lightGray",
	buttonHover = "gray",
}: {
	/** `invisible` en moins : il vaut toujours le fond */
	colors: Omit<ShellColors, "invisible">
	prompt?: string
	/** la barre de titre du cadre : l'accent du theme */
	titleBar: string
	/** le fond derriere le contenu du cadre, visible autour de lui */
	content: string
	border?: string
	button?: string
	buttonHover?: string
}): ShellTheme => ({
	// un texte pose sur `invisible` se fond dans le fond, revele a la selection
	colors: { ...colors, invisible: colors.background },
	prompt,
	fonts: baseFonts,
	container: baseContainer,
	window: { titleBar, border, content, text: "#000000", button, buttonHover },
})

/**
 * Le theme du paquet : la fleur qui lui donne son nom. Fond de feuillage
 * sombre, et des accents pris au 🌼 lui-meme — jaune de pollen sur ce qui
 * compte, vert de tige sur les commandes, orange de petale sur ce qui est
 * refuse. L'invite est la fleur : c'est la marque, elle se voit a chaque
 * ligne.
 */
export const flowerTheme: ShellTheme = makeTheme({
	prompt: "🌼",
	colors: {
		background: "#1E2A22",
		textColor: "#DCE6D8",
		importantColor: "#FFD25F",
		cmdColor: "#9BD46A",
		restrictedColor: "#E4674B",
		infoColor: "#7FC6D9",
		appColor: "#F2A0C4",
	},
	titleBar: "#ed612e",
	content: "#f4ebda",
})

/** le terminal neutre : fond profond, couleurs vives qui ressortent dessus */
export const darkTheme: ShellTheme = makeTheme({
	colors: {
		background: "#212E35",
		textColor: "#CED4DF",
		importantColor: "#FFCC6A",
		cmdColor: "#c4e98d",
		restrictedColor: "#d15f5f",
		infoColor: "#77CDF1",
		appColor: "#90be20",
	},
	titleBar: "#ed612e",
	content: "#f4ebda",
})

/**
 * Le terminal neutre sur clair : fond parchemin, memes couleurs assombries
 * pour tenir la lisibilite (et servir de fond de tag avec un texte blanc).
 */
export const lightTheme: ShellTheme = makeTheme({
	colors: {
		background: "#F5F1E6",
		textColor: "#2A333A",
		importantColor: "#B26A00",
		cmdColor: "#3F7A1E",
		restrictedColor: "#C0392B",
		infoColor: "#1C7FB8",
		appColor: "#5E8A12",
	},
	titleBar: "#ed612e",
	content: "#ffffff",
	border: "#3A3A3A",
	button: "#dddddd",
	buttonHover: "#bbbbbb",
})

/** Dracula : fond ardoise violette, accents satures */
export const draculaTheme: ShellTheme = makeTheme({
	colors: {
		background: "#282A36",
		textColor: "#F8F8F2",
		importantColor: "#F1FA8C",
		cmdColor: "#50FA7B",
		restrictedColor: "#FF5555",
		infoColor: "#8BE9FD",
		appColor: "#BD93F9",
	},
	titleBar: "#BD93F9",
	content: "#F8F8F2",
})

/** Nord : fond bleu nuit, accents froids et bas en saturation */
export const nordTheme: ShellTheme = makeTheme({
	colors: {
		background: "#2E3440",
		textColor: "#D8DEE9",
		importantColor: "#EBCB8B",
		cmdColor: "#A3BE8C",
		restrictedColor: "#BF616A",
		infoColor: "#88C0D0",
		appColor: "#B48EAD",
	},
	titleBar: "#5E81AC",
	content: "#ECEFF4",
})

/** Gruvbox : fond terreux, accents chauds */
export const gruvboxTheme: ShellTheme = makeTheme({
	colors: {
		background: "#282828",
		textColor: "#EBDBB2",
		importantColor: "#FABD2F",
		cmdColor: "#B8BB26",
		restrictedColor: "#FB4934",
		infoColor: "#83A598",
		appColor: "#D3869B",
	},
	titleBar: "#D65D0E",
	content: "#FBF1C7",
})

/** Monokai : fond olive sombre, accents francs */
export const monokaiTheme: ShellTheme = makeTheme({
	colors: {
		background: "#272822",
		textColor: "#F8F8F2",
		importantColor: "#E6DB74",
		cmdColor: "#A6E22E",
		restrictedColor: "#F92672",
		infoColor: "#66D9EF",
		appColor: "#AE81FF",
	},
	titleBar: "#F92672",
	content: "#F8F8F2",
})

/** Solarized, versant clair : fond ivoire, accents mesures */
export const solarizedTheme: ShellTheme = makeTheme({
	colors: {
		background: "#FDF6E3",
		textColor: "#586E75",
		importantColor: "#B58900",
		cmdColor: "#859900",
		restrictedColor: "#DC322F",
		infoColor: "#268BD2",
		appColor: "#6C71C4",
	},
	titleBar: "#268BD2",
	content: "#FFFFFF",
	border: "#93A1A1",
	button: "#EEE8D5",
	buttonHover: "#93A1A1",
})

/**
 * Le catalogue, a la maniere d'un editeur. Le consommateur en passe un a la
 * prop `theme` ; le visiteur en change a la volee par `theme <nom>`. Les
 * clefs sont exactement ce qu'il tape.
 */
export const themes: Record<string, ShellTheme> = {
	flower: flowerTheme,
	dark: darkTheme,
	light: lightTheme,
	dracula: draculaTheme,
	nord: nordTheme,
	gruvbox: gruvboxTheme,
	monokai: monokaiTheme,
	solarized: solarizedTheme,
}

/** les noms du catalogue, dans l'ordre ou ils y sont ecrits */
export const themeNames = (): string[] => Object.keys(themes)

/** le nom du theme de depart, celui que `reset` retrouve */
export const DEFAULT_THEME_NAME = "flower"

/**
 * Le theme du paquet par defaut. `darkTheme` et `lightTheme` restent la
 * pour qui veut un terminal neutre, invite `>` comprise.
 */
export const defaultTheme: ShellTheme = flowerTheme

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
