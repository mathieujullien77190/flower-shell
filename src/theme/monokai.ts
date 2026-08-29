import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/** Monokai : fond olive sombre, accents francs */
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
	titleBar: "#F92672",
	content: "#F8F8F2",
})
