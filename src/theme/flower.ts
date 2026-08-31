import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * The theme of the package: the flower it takes its name from. A background
 * of dark foliage, and accents taken from the 🌼 itself — pollen yellow on
 * what counts, stem green on the commands, petal orange on what is turned
 * down. The prompt is the flower: it is the mark, and it shows on every
 * line.
 */
export const flowerTheme: ShellTheme = makeTheme({
	prompt: "🌼",
	colors: {
		background: "#1E2A22",
		textColor: "#DCE6D8",
		importantColor: "#FFD25F",
		cmdColor: "#9BD46A",
		restrictedColor: "#E4674B",
		infoColor: "#7FC6D9",
		appColor: "#F2A0C4",
	},
	titleBar: "#ed612e",
	content: "#f4ebda",
})
