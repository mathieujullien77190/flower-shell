import type { ShellTheme } from "./types"

/** how a terminal reads at a glance: a light one, or a dark one */
export type ShellTone = "light" | "dark"

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const RGB = /^rgba?\(([^)]+)\)$/i

/**
 * The three channels of a color, 0–255. Hexadecimal and `rgb()` are read;
 * anything else — a named color, `transparent`, a gradient — is not, and
 * says so by answering nothing. Read here and not through the browser: the
 * theme is a module, and it is read at prerender too.
 */
const channels = (color: string): [number, number, number] | null => {
	const value = color.trim()

	const hex = value.match(HEX)
	if (hex) {
		const digits = hex[1]
		const pairs =
			digits.length === 3
				? [...digits].map(digit => `${digit}${digit}`)
				: [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6)]

		return pairs.map(pair => parseInt(pair, 16)) as [number, number, number]
	}

	const rgb = value.match(RGB)
	if (rgb) {
		const numbers = rgb[1]
			.split(/[,/\s]+/)
			.filter(Boolean)
			.map(Number)

		if (numbers.length < 3 || numbers.slice(0, 3).some(Number.isNaN))
			return null

		return numbers.slice(0, 3) as [number, number, number]
	}

	return null
}

/**
 * Light or dark, read off the background alone: it is the one color that
 * fills the terminal, and the eye judges the theme by it.
 *
 * The green weighs the most and the blue the least, the way the eye takes
 * them; half way up the scale separates the two. A background that cannot
 * be read — a named color, `transparent` — answers nothing rather than
 * guessing, and the theme is then simply announced without a tone.
 */
export const themeTone = (theme?: ShellTheme): ShellTone | null => {
	if (!theme) return null

	const rgb = channels(theme.colors.background)
	if (!rgb) return null

	const [red, green, blue] = rgb

	return 0.2126 * red + 0.7152 * green + 0.0722 * blue > 128 ? "light" : "dark"
}
