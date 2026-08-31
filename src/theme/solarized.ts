import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/** Solarized, the light side: ivory background, measured accents */
export const solarizedTheme: ShellTheme = makeTheme({
	colors: {
		background: "#FDF6E3",
		textColor: "#586E75",
		importantColor: "#B58900",
		cmdColor: "#859900",
		restrictedColor: "#DC322F",
		infoColor: "#268BD2",
		appColor: "#6C71C4",
	},
})
