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
