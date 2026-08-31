import { CSSProperties } from "react"

import type { ShellColors, ShellFonts, ShellTheme } from "./types"

/**
 * The terminal breathes: without this padding, the output and the input
 * stick to the edges of whatever holds the shell.
 */
export const baseContainer: CSSProperties = {
	padding: "16px",
}

/** same font for every theme: a terminal wants a monospace */
export const baseFonts: ShellFonts = {
	shell: "monospace",
}

/**
 * A theme comes down to its palette, its prompt and the box it is served in.
 * The font does not vary — a terminal wants a monospace — so writing the
 * eight themes in full would have copied that line over.
 *
 * `container` is laid on `baseContainer`: a theme that only wants a border
 * says so and keeps the padding.
 */
export const makeTheme = ({
	colors,
	prompt = ">",
	container,
}: {
	/** `invisible` left out: it always equals the background */
	colors: Omit<ShellColors, "invisible">
	prompt?: string
	/** the box the terminal is served in: padding, border, radius */
	container?: CSSProperties
}): ShellTheme => ({
	// a text laid on `invisible` blends into the background, revealed by
	// selecting it
	colors: { ...colors, invisible: colors.background },
	prompt,
	fonts: baseFonts,
	container: { ...baseContainer, ...container },
})
