import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/** Gruvbox: earthy background, warm accents */
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
	// blocky, barely rounded, to go with the earth
	container: { padding: "18px", border: "solid 2px #FABD2F", borderRadius: 2 },
})
