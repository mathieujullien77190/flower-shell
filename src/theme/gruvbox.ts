import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/** Gruvbox : fond terreux, accents chauds */
export const gruvboxTheme: ShellTheme = makeTheme({
	colors: {
		background: "#282828",
		textColor: "#EBDBB2",
		importantColor: "#FABD2F",
		cmdColor: "#B8BB26",
		restrictedColor: "#FB4934",
		infoColor: "#83A598",
		appColor: "#D3869B",
	},
	titleBar: "#D65D0E",
	content: "#FBF1C7",
})
