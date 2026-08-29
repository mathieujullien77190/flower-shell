import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/** Solarized, versant clair : fond ivoire, accents mesures */
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
	titleBar: "#268BD2",
	content: "#FFFFFF",
	border: "#93A1A1",
	button: "#EEE8D5",
	buttonHover: "#93A1A1",
})
