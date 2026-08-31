import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/** Twilight: the neutral terminal, deep background, bright colors on it */
export const twilightTheme: ShellTheme = makeTheme({
	colors: {
		background: "#212E35",
		textColor: "#CED4DF",
		importantColor: "#FFCC6A",
		cmdColor: "#c4e98d",
		restrictedColor: "#d15f5f",
		infoColor: "#77CDF1",
		appColor: "#90be20",
	},
})
