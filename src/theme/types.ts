import { CSSProperties } from "react"

export type ShellColors = {
	background: string
	textColor: string
	/** what counts in a text */
	importantColor: string
	/** the name of a command that was played */
	cmdColor: string
	/** the name of a restricted command */
	restrictedColor: string
	infoColor: string
	appColor: string
	/** the color of the background: a text laid on it stays invisible */
	invisible: string
	/** the thumb of the scrollbar, the part one drags */
	scrollbarThumb: string
	/** the groove the thumb slides in */
	scrollbarTrack: string
}

/** the font of the shell: it dresses the output and the input alike */
export type ShellFonts = {
	shell: string
	/**
	 * The size of the terminal, in pixels: the output and the input take it,
	 * and the ASCII art is measured on it. 16 unless the theme says
	 * otherwise — a theme meant to be read from far, or badly, raises it.
	 */
	size: number
	/**
	 * The size of the logo, the ASCII art the `title` command draws. A CSS
	 * length and not a number of pixels: it is written on the width of the
	 * container — `calc(100cqw / 90)` by default — so the logo keeps its
	 * shape whatever the terminal is served in. A theme wanting it bigger
	 * divides by less.
	 */
	logo: string
}

export type ShellTheme = {
	colors: ShellColors
	/** the prompt, set before the input and before every command */
	prompt: string
	fonts: ShellFonts
	/**
	 * The style of the general container of the terminal, set inline on it.
	 * Open to any CSSProperties and not to padding alone: the inner padding
	 * is the everyday need, but a rounding, a border or a shadow go in the
	 * same place. Covers the base style of the container, property by
	 * property.
	 */
	container: CSSProperties
}

/**
 * What a consumer is allowed to give: everything is optional, inside the
 * sub-objects included. A Partial<ShellTheme> would not do, it would demand
 * the color groups in full.
 */
export type ShellThemeInput = {
	colors?: Partial<ShellColors>
	prompt?: string
	fonts?: Partial<ShellFonts>
	container?: CSSProperties
}
