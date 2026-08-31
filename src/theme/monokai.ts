import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/** Monokai: dark olive background, blunt accents */
export const monokaiTheme: ShellTheme = makeTheme({
	colors: {
		background: "#272822",
		textColor: "#F8F8F2",
		importantColor: "#E6DB74",
		cmdColor: "#A6E22E",
		restrictedColor: "#F92672",
		infoColor: "#66D9EF",
		appColor: "#AE81FF",
	},
	// no rounding at all, and the magenta it is known for
	container: { padding: "18px", border: "solid 2px #F92672", borderRadius: 0 },
})
