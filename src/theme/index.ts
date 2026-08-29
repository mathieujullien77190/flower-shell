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
 * Le catalogue, a la maniere d'un editeur. Le consommateur en passe un a la
 * prop `theme` ; le visiteur en change a la volee par `theme <nom>`. Les
 * clefs sont exactement ce qu'il tape.
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

/** les noms du catalogue, dans l'ordre ou ils y sont ecrits */
export const themeNames = (): string[] => Object.keys(themes)

/** le nom du theme de depart, celui que `reset` retrouve */
export const DEFAULT_THEME_NAME = "flower"

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
