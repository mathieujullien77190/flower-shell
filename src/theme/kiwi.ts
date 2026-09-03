import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * Kiwi 🥝: the fruit cut open. The husk for a ground, the green of the flesh
 * on the commands, and the pale ring of the seeds on what counts.
 */
export const kiwiTheme: ShellTheme = makeTheme({
	prompt: "🥝",
	colors: {
		background: "#2A2118",
		textColor: "#E6EFD8",
		importantColor: "#D9E76C",
		cmdColor: "#7ED957",
		restrictedColor: "#F07167",
		infoColor: "#6FD3C4",
		appColor: "#C98F4B",
	},
	// round, like what it is named after
	container: { padding: "20px", border: "solid 2px #7ED957", borderRadius: 14 },
})
