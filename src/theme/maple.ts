import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * Maple 🍁: autumn after dusk. Bark for a background, and the leaf itself
 * on what counts — gold, then red — with the moss it fell on and the cold
 * sky above.
 */
export const mapleTheme: ShellTheme = makeTheme({
	prompt: "🍁",
	colors: {
		background: "#1E1512",
		textColor: "#EFDCCB",
		importantColor: "#F5A623",
		cmdColor: "#A9B665",
		restrictedColor: "#E0503F",
		infoColor: "#7FA9B8",
		appColor: "#B4694A",
	},
	// pointed, like the leaf: the corners barely give
	container: { padding: "18px", border: "solid 2px #E0503F", borderRadius: 2 },
})
