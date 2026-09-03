import { CSSProperties } from "react"

import { flowerTheme } from "./flower"
import { hibiscusTheme } from "./hibiscus"
import { sunflowerTheme } from "./sunflower"
import { mapleTheme } from "./maple"
import { lavenderTheme } from "./lavender"
import { riceTheme } from "./rice"
import { nestTheme } from "./nest"
import type {
	ShellColors,
	ShellFonts,
	ShellTheme,
	ShellThemeInput,
} from "./types"

export type {
	ShellColors,
	ShellFonts,
	ShellTheme,
	ShellThemeInput,
} from "./types"

export { themeTone } from "./tone"
export type { ShellTone } from "./tone"

export { flowerTheme } from "./flower"
export { hibiscusTheme } from "./hibiscus"
export { sunflowerTheme } from "./sunflower"
export { mapleTheme } from "./maple"
export { lavenderTheme } from "./lavender"
export { riceTheme } from "./rice"
export { nestTheme } from "./nest"

/**
 * The catalogue of the package, the way a publisher would have one. It is
 * not mounted by default: it is what the `themes` prop takes, and the
 * consumer passes it whole, in part, or not at all.
 */
export const themes: Record<string, ShellTheme> = {
	flower: flowerTheme,
	hibiscus: hibiscusTheme,
	sunflower: sunflowerTheme,
	maple: mapleTheme,
	lavender: lavenderTheme,
	rice: riceTheme,
	nest: nestTheme,
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
		// `auto` and not a color: the scrollbar of the browser, untouched,
		// the way the rest of the bare theme paints nothing
		scrollbarThumb: "auto",
		scrollbarTrack: "auto",
	},
	prompt: ">",
	fonts: { shell: "inherit" },
	container: {},
}

/**
 * The default theme of the package: the flower it is named after. The
 * catalogue turns around it — three dark themes, three light ones, each one
 * a thing that grows and each one wearing its emoji for a prompt.
 */
export const defaultTheme: ShellTheme = flowerTheme

/**
 * The theme lives at module level: the markup is rendered by a function, not
 * by a component, and a ThemeProvider would not reach it.
 *
 * It is therefore the one thing several terminals on the same page share.
 * Their history, their cursor and their options belong to each; the palette
 * does not, and switching it in one repaints the others.
 */
let current: ShellTheme = defaultTheme

/** a partial theme laid on a full one: what it leaves out is kept */
const lay = (base: ShellTheme, input: ShellThemeInput): ShellTheme => ({
	colors: { ...base.colors, ...input.colors },
	prompt: input.prompt || base.prompt,
	fonts: { ...base.fonts, ...input.fonts },
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

export const fonts = (): ShellFonts => current.fonts

/** the style laid on the general container of the terminal */
export const container = (): CSSProperties => current.container

/**
 * The scrollbar of the terminal, ready for CSS: the pair `scrollbar-color`
 * takes, and the width that goes with it.
 *
 * A theme that leaves its scrollbar colors on `auto` — `bareTheme` is the
 * one — gets the scrollbar of the browser, whole: `scrollbar-color` refuses
 * a pair with `auto` in it, and a themed width on a browser scrollbar would
 * be the one thing painted on a shell that paints nothing.
 */
export const scrollbar = (): { color: string; width: string } => {
	const { scrollbarThumb, scrollbarTrack } = current.colors
	const bare = scrollbarThumb === "auto" || scrollbarTrack === "auto"

	return bare
		? { color: "auto", width: "auto" }
		: { color: `${scrollbarThumb} ${scrollbarTrack}`, width: "thin" }
}

export type { CSSProperties }
