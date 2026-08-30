import { CSSProperties } from "react"

import { twilightTheme } from "./twilight"
import { draculaTheme } from "./dracula"
import { flowerTheme } from "./flower"
import { gruvboxTheme } from "./gruvbox"
import { parchmentTheme } from "./parchment"
import { monokaiTheme } from "./monokai"
import { nordTheme } from "./nord"
import { solarizedTheme } from "./solarized"
import type {
	ShellColors,
	ShellFonts,
	ShellTheme,
	ShellThemeInput,
	WindowColors,
} from "./types"

export type {
	ShellColors,
	ShellFonts,
	ShellTheme,
	ShellThemeInput,
	WindowColors,
} from "./types"

export { twilightTheme } from "./twilight"
export { draculaTheme } from "./dracula"
export { flowerTheme } from "./flower"
export { gruvboxTheme } from "./gruvbox"
export { parchmentTheme } from "./parchment"
export { monokaiTheme } from "./monokai"
export { nordTheme } from "./nord"
export { solarizedTheme } from "./solarized"

/**
 * Le catalogue du paquet, a la maniere d'un editeur. Il n'est pas monte
 * d'office : c'est la valeur par defaut de la prop `themes`, et le
 * consommateur le passe tel quel, en partie, ou pas du tout.
 */
export const themes: Record<string, ShellTheme> = {
	flower: flowerTheme,
	twilight: twilightTheme,
	parchment: parchmentTheme,
	dracula: draculaTheme,
	nord: nordTheme,
	gruvbox: gruvboxTheme,
	monokai: monokaiTheme,
	solarized: solarizedTheme,
}

/** le nom du theme de depart, celui que `reset` retrouve */
export const DEFAULT_THEME_NAME = "flower"

/**
 * Le theme de qui n'en donne aucun : rien n'est pose, tout est herite.
 * Le shell prend alors les couleurs et la police de la page qui le tient,
 * et le balisage cesse de colorer — un marqueur ne fait plus que decouper
 * le texte.
 *
 * `transparent` et non une couleur : un fond pose, meme blanc, recouvrirait
 * celui du consommateur. Ce qui n'est pas donne ne doit rien peindre.
 */
export const bareTheme: ShellTheme = {
	colors: {
		background: "transparent",
		textColor: "inherit",
		importantColor: "inherit",
		cmdColor: "inherit",
		restrictedColor: "inherit",
		infoColor: "inherit",
		appColor: "inherit",
		invisible: "transparent",
	},
	prompt: ">",
	fonts: { shell: "inherit", window: "inherit" },
	window: {
		titleBar: "transparent",
		border: "currentColor",
		content: "transparent",
		text: "inherit",
		button: "inherit",
		buttonHover: "inherit",
	},
	container: {},
}

/**
 * Le theme du paquet par defaut. `twilightTheme` et `parchmentTheme` restent
 * la pour qui veut un terminal neutre, invite `>` comprise.
 */
export const defaultTheme: ShellTheme = flowerTheme

/**
 * Le theme vit au niveau du module, comme le registre des commandes : le
 * balisage est rendu par une fonction, pas par un composant, un
 * ThemeProvider ne l'atteindrait pas. Corollaire assume : un shell par page.
 */
let current: ShellTheme = defaultTheme

/** un theme partiel pose sur un theme complet : ce qu'il tait est garde */
const lay = (base: ShellTheme, input: ShellThemeInput): ShellTheme => ({
	colors: { ...base.colors, ...input.colors },
	prompt: input.prompt || base.prompt,
	fonts: { ...base.fonts, ...input.fonts },
	window: { ...base.window, ...input.window },
	container: { ...base.container, ...input.container },
})

export const setTheme = (theme?: ShellThemeInput) => {
	if (!theme) return

	current = lay(current, theme)
}

/**
 * Les themes que le visiteur peut prendre, indexes par le nom qu'il tape.
 * Ils vivent au niveau du module pour la meme raison que le theme courant :
 * la commande `theme` les lit hors de tout composant.
 *
 * Chacun est pose sur `defaultTheme` en arrivant, et non sur le theme
 * courant : un theme partiel donne toujours le meme resultat, quel que
 * soit celui qu'on quitte.
 */
let mounted: Record<string, ShellTheme> = {}

/**
 * Les themes du shell sont exactement les clefs de ce qu'on donne ici —
 * rien de plus. `themes={{ flower: flowerTheme, mine }}` en monte deux,
 * `themes={themes}` monte le catalogue du paquet en entier.
 *
 * Sans argument, aucun : le visiteur n'a alors rien a prendre, et c'est
 * assume. Ce qu'on ne donne pas n'existe pas.
 */
export const setThemes = (custom?: Record<string, ShellThemeInput>) => {
	mounted = Object.keys(custom || {}).reduce(
		(all, name) => ({ ...all, [name]: lay(defaultTheme, custom![name]) }),
		{} as Record<string, ShellTheme>
	)
}

/**
 * Ce que le shell porte au demarrage, dans cet ordre : le theme du
 * catalogue qui porte ce nom, sinon le premier du catalogue, sinon rien.
 *
 * Le nom, et non le theme lui-meme : `themes` dit ce qui existe, `theme`
 * lequel on porte — comme `dict` dit les langues et `lang` celle du
 * depart. Un nom qu'on ne trouve pas est ignore plutot que monte en
 * douce : partir sur un theme que le visiteur ne peut pas retrouver, ni
 * `theme <nom>` ni `help theme` ne sauraient l'expliquer.
 *
 * A appeler apres `setThemes`, dont il lit le resultat.
 */
export const wearTheme = (name?: string) => {
	current = (name && mounted[name]) || Object.values(mounted)[0] || bareTheme
}

/**
 * Les noms acceptes par la commande `theme` : ceux du catalogue monte. Une
 * fonction, et non une constante : le consommateur pose le sien bien apres
 * l'ecriture des commandes.
 */
export const themeNames = (): string[] => Object.keys(mounted)

/** le theme monte sous ce nom, s'il existe */
export const themeByName = (name: string): ShellTheme | undefined =>
	mounted[name]

export const theme = () => current

/** raccourci de lecture, le plus frequent dans les styles */
export const colors = (): ShellColors => current.colors

export const windowColors = (): WindowColors => current.window

export const fonts = (): ShellFonts => current.fonts

/** le style pose sur le conteneur general du terminal */
export const container = (): CSSProperties => current.container

export type { CSSProperties }
