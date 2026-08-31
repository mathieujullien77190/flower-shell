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
 * The catalogue of the package, the way a publisher would have one. It is
 * not mounted by default: it is what the `themes` prop takes, and the
 * consumer passes it whole, in part, or not at all.
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

/** the name of the starting theme, the one `reset` finds back */
export const DEFAULT_THEME_NAME = "flower"

/**
 * The theme of whoever gives none: nothing is set, everything is inherited.
 * The shell then takes the colors and the font of the page holding it, and
 * the markup stops coloring — a marker only cuts the text up any more.
 *
 * `transparent` and not a color: a background that is set, even white,
 * would cover the consumer's. What is not given must paint nothing.
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
 * The default theme of the package. `twilightTheme` and `parchmentTheme`
 * stay there for whoever wants a neutral terminal, `>` prompt included.
 */
export const defaultTheme: ShellTheme = flowerTheme

/**
 * The theme lives at module level, like the registry of the commands: the
 * markup is rendered by a function, not by a component, and a ThemeProvider
 * would not reach it. Corollary, knowingly: one shell per page.
 */
let current: ShellTheme = defaultTheme

/** a partial theme laid on a full one: what it leaves out is kept */
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
 * The themes the visitor can take, indexed by the name they type. They live
 * at module level for the same reason as the current theme: the `theme`
 * command reads them outside of any component.
 *
 * Each one is laid on `defaultTheme` as it arrives, and not on the current
 * theme: a partial theme always gives the same result, whichever one is
 * being left.
 */
let mounted: Record<string, ShellTheme> = {}

/**
 * The themes of the shell are exactly the keys of what is given here —
 * nothing more. `themes={{ flower: flowerTheme, mine }}` mounts two,
 * `themes={themes}` mounts the whole catalogue of the package.
 *
 * Without an argument, none: the visitor then has nothing to take, and that
 * is on purpose. What is not given does not exist.
 */
export const setThemes = (custom?: Record<string, ShellThemeInput>) => {
	mounted = Object.keys(custom || {}).reduce(
		(all, name) => ({ ...all, [name]: lay(defaultTheme, custom![name]) }),
		{} as Record<string, ShellTheme>
	)
}

/**
 * What the shell wears at startup, in this order: the theme of the
 * catalogue carrying that name, else the first of the catalogue, else
 * nothing.
 *
 * The name, and not the theme itself: `themes` says what exists, `theme`
 * which one is worn — the way `dict` says the languages and `lang` the one
 * to start on. A name that is not found is ignored rather than quietly
 * mounted: starting on a theme the visitor cannot find again is something
 * neither `theme <name>` nor `help theme` could explain.
 *
 * To be called after `setThemes`, whose result it reads.
 */
export const wearTheme = (name?: string) => {
	current = (name && mounted[name]) || Object.values(mounted)[0] || bareTheme
}

/**
 * The names the `theme` command accepts: those of the mounted catalogue. A
 * function, and not a constant: the consumer sets theirs long after the
 * commands have been written.
 */
export const themeNames = (): string[] => Object.keys(mounted)

/** the theme mounted under that name, if it exists */
export const themeByName = (name: string): ShellTheme | undefined =>
	mounted[name]

export const theme = () => current

/** reading shortcut, the most frequent one in the styles */
export const colors = (): ShellColors => current.colors

export const windowColors = (): WindowColors => current.window

export const fonts = (): ShellFonts => current.fonts

/** the style laid on the general container of the terminal */
export const container = (): CSSProperties => current.container

export type { CSSProperties }
