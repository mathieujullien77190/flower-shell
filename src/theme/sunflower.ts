import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * Sunflower 🌻: the field seen from the ground. Dark loam for a background,
 * the petal yellow on what counts, the stem and the summer sky around it.
 */
export const sunflowerTheme: ShellTheme = makeTheme({
	prompt: "🌻",
	colors: {
		background: "#221C10",
		textColor: "#F1E7CE",
		importantColor: "#FFC93C",
		cmdColor: "#A8C256",
		restrictedColor: "#E4693B",
		infoColor: "#6FA8DC",
		appColor: "#C08457",
	},
	container: { padding: "18px", border: "solid 2px #FFC93C", borderRadius: 8 },
})
