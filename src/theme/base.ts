import { CSSProperties } from "react"

import type { ShellColors, ShellFonts, ShellTheme } from "./types"

/**
 * The terminal breathes: without this padding, the output and the input
 * stick to the edges of whatever holds the shell.
 */
export const baseContainer: CSSProperties = {
	padding: "16px",
}

/** same fonts for every theme: a terminal wants a monospace */
export const baseFonts: ShellFonts = {
	shell: "monospace",
	window: "monospace",
}

/**
 * A theme comes down to its palette. The rest does not vary — same fonts,
 * same padding — and the frame of the window holds in two colors. Writing
 * the eight themes in full would have copied the same thirty odd lines
 * over.
 */
export const makeTheme = ({
	colors,
	prompt = ">",
	titleBar,
	content,
	border = "#000000",
	button = "lightGray",
	buttonHover = "gray",
}: {
	/** `invisible` left out: it always equals the background */
	colors: Omit<ShellColors, "invisible">
	prompt?: string
	/** the title bar of the frame: the accent of the theme */
	titleBar: string
	/** the background behind the content of the frame, visible around it */
	content: string
	border?: string
	button?: string
	buttonHover?: string
}): ShellTheme => ({
	// a text laid on `invisible` blends into the background, revealed by
	// selecting it
	colors: { ...colors, invisible: colors.background },
	prompt,
	fonts: baseFonts,
	container: baseContainer,
	window: { titleBar, border, content, text: "#000000", button, buttonHover },
})
