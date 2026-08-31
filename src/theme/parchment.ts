import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * Parchment: the neutral terminal on a light ground. Parchment background,
 * the same colors darkened to hold the readability (and to serve as a tag
 * background under a white text).
 */
export const parchmentTheme: ShellTheme = makeTheme({
	colors: {
		background: "#F5F1E6",
		textColor: "#2A333A",
		importantColor: "#B26A00",
		cmdColor: "#3F7A1E",
		restrictedColor: "#C0392B",
		infoColor: "#1C7FB8",
		appColor: "#5E8A12",
	},
	// a sheet: wide margins, and an edge that reads as a fold rather
	// than a frame
	container: {
		padding: "24px",
		border: "solid 1px #2A333A26",
		borderRadius: 6,
	},
})
