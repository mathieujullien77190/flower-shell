import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * Nest 🪺: the eggs in the twigs. Shell beige for a ground, the twig brown
 * for the accent, and the blue of the eggs on what informs.
 */
export const nestTheme: ShellTheme = makeTheme({
	prompt: "🪺",
	colors: {
		background: "#F6EFE4",
		textColor: "#40342A",
		importantColor: "#A9762A",
		cmdColor: "#5E7F4F",
		restrictedColor: "#B0503C",
		infoColor: "#2F8C8A",
		appColor: "#6B4C3B",
	},
	// round and thick, the way one is woven
	container: { padding: "20px", border: "solid 2px #6B4C3B", borderRadius: 16 },
})
