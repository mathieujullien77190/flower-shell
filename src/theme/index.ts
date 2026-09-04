import { CSSProperties } from "react"

import { playingInstance } from "@state/instance"
import { defaultTheme, lay, prepareThemes, worn } from "./catalogue"
import { flowerTheme } from "./flower"
import { hibiscusTheme } from "./hibiscus"
import { kiwiTheme } from "./kiwi"
import { contrastTheme } from "./contrast"
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

export { bareTheme, defaultTheme } from "./catalogue"
export { themeTone } from "./tone"
export type { ShellTone } from "./tone"

export { flowerTheme } from "./flower"
export { hibiscusTheme } from "./hibiscus"
export { kiwiTheme } from "./kiwi"
export { contrastTheme } from "./contrast"
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
	kiwi: kiwiTheme,
	contrast: contrastTheme,
	maple: mapleTheme,
	lavender: lavenderTheme,
	rice: riceTheme,
	nest: nestTheme,
}

/** the name of the starting theme, the one `reset` finds back */
export const DEFAULT_THEME_NAME = "flower"

/**
 * The theme of whoever is not a shell. Every terminal wears its own — its
 * `themes` catalogue and the name it wears out of it, both held by its
 * instance — and this one only answers a read made outside of any command:
 * `highlight()` played on a text of yours, in a component of yours.
 */
let outside: ShellTheme = defaultTheme

/** the theme in play: the one the shell playing wears, else the page's */
const current = (): ShellTheme => playingInstance()?.theme() || outside

/**
 * What a read outside of a shell answers. It does not reach into the
 * terminals of the page: a `<Shell>` takes its own through `themes`, and two
 * of them side by side no longer repaint each other.
 */
export const setTheme = (theme?: ShellThemeInput) => {
	if (!theme) return

	outside = lay(outside, theme)
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
	mounted = prepareThemes(custom)
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
	outside = worn(mounted, name)
}

/**
 * The names the `theme` command accepts: those of the mounted catalogue. A
 * function, and not a constant: the consumer sets theirs long after the
 * commands have been written.
 */
export const themeNames = (): string[] =>
	Object.keys(playingInstance()?.themes() || mounted)

/** the theme mounted under that name, if it exists */
export const themeByName = (name: string): ShellTheme | undefined =>
	(playingInstance()?.themes() || mounted)[name]

export const theme = () => current()

/** reading shortcut, the most frequent one in the styles */
export const colors = (): ShellColors => current().colors

export const fonts = (): ShellFonts => current().fonts

/** the style laid on the general container of the terminal */
export const container = (): CSSProperties => current().container

/**
 * The scrollbar of the terminal, ready for CSS: the pair `scrollbar-color`
 * takes, and the width that goes with it.
 *
 * A theme that leaves its scrollbar colors on `auto` — `bareTheme` is the
 * one — gets the scrollbar of the browser, whole: `scrollbar-color` refuses
 * a pair with `auto` in it, and a themed width on a browser scrollbar would
 * be the one thing painted on a shell that paints nothing.
 *
 * It takes the theme it dresses: the styled-component that calls it reads it
 * off the provider of its own terminal. Given none, the theme in play.
 */
export const scrollbar = (
	worn: ShellTheme = current()
): { color: string; width: string } => {
	const { scrollbarThumb, scrollbarTrack } = worn.colors
	const bare = scrollbarThumb === "auto" || scrollbarTrack === "auto"

	return bare
		? { color: "auto", width: "auto" }
		: { color: `${scrollbarThumb} ${scrollbarTrack}`, width: "thin" }
}

export type { CSSProperties }
