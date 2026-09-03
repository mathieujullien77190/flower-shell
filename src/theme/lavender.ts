import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * Lavender 🪻: the field in full sun. A pale lilac ground and the colors
 * darkened to hold on it — a violet on what counts, the grey green of the
 * stems on the commands.
 */
export const lavenderTheme: ShellTheme = makeTheme({
	prompt: "🪻",
	colors: {
		background: "#F4F0FA",
		textColor: "#3B3448",
		importantColor: "#6D3FA6",
		cmdColor: "#4E7A57",
		restrictedColor: "#B33A5A",
		infoColor: "#2F6FA8",
		appColor: "#A8548A",
	},
	// a hairline in the violet of the theme, and room around the rows
	container: {
		padding: "20px",
		border: "solid 1px #6D3FA633",
		borderRadius: 10,
	},
})
