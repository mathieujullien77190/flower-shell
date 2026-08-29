import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/** Dracula : fond ardoise violette, accents satures */
export const draculaTheme: ShellTheme = makeTheme({
	colors: {
		background: "#282A36",
		textColor: "#F8F8F2",
		importantColor: "#F1FA8C",
		cmdColor: "#50FA7B",
		restrictedColor: "#FF5555",
		infoColor: "#8BE9FD",
		appColor: "#BD93F9",
	},
	titleBar: "#BD93F9",
	content: "#F8F8F2",
})
