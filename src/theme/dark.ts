import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/** le terminal neutre : fond profond, couleurs vives qui ressortent dessus */
export const darkTheme: ShellTheme = makeTheme({
	colors: {
		background: "#212E35",
		textColor: "#CED4DF",
		importantColor: "#FFCC6A",
		cmdColor: "#c4e98d",
		restrictedColor: "#d15f5f",
		infoColor: "#77CDF1",
		appColor: "#90be20",
	},
	titleBar: "#ed612e",
	content: "#f4ebda",
})
