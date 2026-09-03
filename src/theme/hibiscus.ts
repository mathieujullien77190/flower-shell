import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * Hibiscus 🌺: the flower at night. A wine dark ground, the petal for the
 * accent and the stamen — pollen yellow — on what counts. The warmest of
 * the dark themes.
 */
export const hibiscusTheme: ShellTheme = makeTheme({
	prompt: "🌺",
	colors: {
		background: "#241019",
		textColor: "#F2DDE4",
		importantColor: "#FFD166",
		cmdColor: "#7FD1A5",
		restrictedColor: "#FF5C7A",
		infoColor: "#79C7E3",
		appColor: "#FF6FA5",
	},
	// the petal, run around the box, and rounded the way one is
	container: { padding: "20px", border: "solid 2px #FF6FA5", borderRadius: 12 },
})
