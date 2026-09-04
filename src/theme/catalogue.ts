import { flowerTheme } from "./flower"
import type { ShellTheme, ShellThemeInput } from "./types"

/**
 * The default theme of the package: the flower it is named after. The
 * catalogue turns around it — four dark themes, three light ones, each one
 * named after a thing that grows and wearing its emoji for a prompt, plus
 * `contrast`, which is there to be read and not to be looked at.
 */
export const defaultTheme: ShellTheme = flowerTheme

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
	fonts: { shell: "inherit", size: 16, logo: "calc(100cqw / 90)" },
	container: {},
}

/** a partial theme laid on a full one: what it leaves out is kept */
export const lay = (base: ShellTheme, input: ShellThemeInput): ShellTheme => ({
	colors: { ...base.colors, ...input.colors },
	prompt: input.prompt || base.prompt,
	fonts: { ...base.fonts, ...input.fonts },
	container: { ...base.container, ...input.container },
})

/**
 * The themes of one shell, ready to be worn: exactly the keys given here,
 * each laid on `defaultTheme` as it arrives — and not on the theme being
 * left, so a partial theme always gives the same result whichever one it
 * replaces.
 *
 * Given nothing, none: the visitor then has nothing to take, and that is on
 * purpose. What is not given does not exist.
 *
 * It lives here rather than in `index.ts` so that an instance can prepare
 * its own without importing the module that reads the instance in play.
 */
export const prepareThemes = (
	custom?: Record<string, ShellThemeInput>
): Record<string, ShellTheme> =>
	Object.keys(custom || {}).reduce(
		(all, name) => ({ ...all, [name]: lay(defaultTheme, custom![name]) }),
		{} as Record<string, ShellTheme>
	)

/**
 * What a shell wears, in this order: the theme of its catalogue carrying
 * that name, else the first of the catalogue, else nothing.
 *
 * The name, and not the theme itself: `themes` says what exists, `theme`
 * which one is worn — the way `dict` says the languages and `lang` the one
 * to start on. A name that is not found is ignored rather than quietly
 * mounted: starting on a theme the visitor cannot find again is something
 * neither `theme <name>` nor `help theme` could explain.
 */
export const worn = (
	catalogue: Record<string, ShellTheme>,
	name?: string
): ShellTheme =>
	(name && catalogue[name]) || Object.values(catalogue)[0] || bareTheme
