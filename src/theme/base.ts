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
	size: 16,
	logo: "calc(100cqw / 90)",
}

/**
 * A theme comes down to its palette, its prompt and the box it is served in.
 * The font does not vary — a terminal wants a monospace — so writing the
 * seven themes in full would have copied that line over.
 *
 * `container` is laid on `baseContainer`: a theme that only wants a border
 * says so and keeps the padding.
 */
export const makeTheme = ({
	colors,
	prompt = ">",
	fonts,
	container,
}: {
	/**
	 * `invisible` left out: it always equals the background. The two
	 * scrollbar colors are optional — the text and the background make a
	 * scrollbar that goes with the palette, and a theme says otherwise only
	 * if it wants to.
	 */
	colors: Omit<ShellColors, "invisible" | "scrollbarThumb" | "scrollbarTrack"> &
		Partial<Pick<ShellColors, "scrollbarThumb" | "scrollbarTrack">>
	prompt?: string
	/**
	 * The font, if the theme wants another one: what it leaves out keeps the
	 * monospace, the 16 pixels and the logo size every theme is written on.
	 */
	fonts?: Partial<ShellFonts>
	/** the box the terminal is served in: padding, border, radius */
	container?: CSSProperties
}): ShellTheme => ({
	// a text laid on `invisible` blends into the background, revealed by
	// selecting it
	colors: {
		...colors,
		invisible: colors.background,
		scrollbarThumb: colors.scrollbarThumb ?? colors.textColor,
		scrollbarTrack: colors.scrollbarTrack ?? colors.background,
	},
	prompt,
	fonts: { ...baseFonts, ...fonts },
	container: { ...baseContainer, ...container },
})
