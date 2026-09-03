import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * Rice 🌾: the ear when it is ripe. Straw for a ground, the gold of the
 * grain on what counts, the green of the stalk and the water of the paddy
 * around it. The most measured of the light themes.
 */
export const riceTheme: ShellTheme = makeTheme({
	prompt: "🌾",
	colors: {
		background: "#FAF6E9",
		textColor: "#3A3A2E",
		importantColor: "#B27B12",
		cmdColor: "#5C7A29",
		restrictedColor: "#B4452F",
		infoColor: "#2E7A8C",
		appColor: "#6C5CA6",
	},
	// a sheet: wide margins, an edge that reads as a fold rather than a frame
	container: {
		padding: "24px",
		border: "solid 1px #3A3A2E26",
		borderRadius: 4,
	},
})
