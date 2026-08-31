import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/** Nord: midnight blue background, cold accents low on saturation */
export const nordTheme: ShellTheme = makeTheme({
	colors: {
		background: "#2E3440",
		textColor: "#D8DEE9",
		importantColor: "#EBCB8B",
		cmdColor: "#A3BE8C",
		restrictedColor: "#BF616A",
		infoColor: "#88C0D0",
		appColor: "#B48EAD",
	},
	// squarer than the others: the cold end of the catalogue
	container: { padding: "18px", border: "solid 2px #88C0D0", borderRadius: 4 },
})
