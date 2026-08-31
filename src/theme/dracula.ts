import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/** Dracula: purple slate background, saturated accents */
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
	container: { padding: "18px", border: "solid 2px #BD93F9", borderRadius: 8 },
})
