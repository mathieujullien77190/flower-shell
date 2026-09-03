import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * Contrast 🌻: the one theme of the catalogue that is not named after what
 * it looks like, because it is not there to be looked at. It is for reading
 * — a screen read from far, or read badly.
 *
 * Pure black under pure white, and every accent kept above a contrast ratio
 * of 7:1 on that ground, which is what WCAG asks at its highest level: the
 * red and the magenta are lightened until they hold it, where the plain ones
 * fall to 5:1 and 6:1. The letters are bigger and the frame is thick and
 * square.
 *
 * The sunflower for a prompt: it is the mark worn by whoever carries
 * something that does not show — the Hidden Disabilities Sunflower, born in
 * a London airport and worn well beyond since. It says what this theme is
 * for on the very line one types.
 */
export const contrastTheme: ShellTheme = makeTheme({
	prompt: "🌻",
	colors: {
		background: "#000000",
		textColor: "#FFFFFF",
		importantColor: "#FFFF00",
		cmdColor: "#00FF00",
		restrictedColor: "#FF6E6E",
		infoColor: "#00FFFF",
		appColor: "#FF7BFF",
	},
	fonts: { size: 20 },
	container: { padding: "20px", border: "solid 3px #FFFFFF", borderRadius: 0 },
})
