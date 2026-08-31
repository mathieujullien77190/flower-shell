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
}

/**
 * The fonts. The one of the shell dresses the output and the input, the one
 * of the window its title bar. They are kept apart: a terminal wants a
 * monospace, a frame not necessarily.
 */
export type ShellFonts = {
	shell: string
	window: string
}

/** the frame of the window: title bar, border, buttons */
export type WindowColors = {
	titleBar: string
	border: string
	/** the background behind the content, visible around it */
	content: string
	text: string
	button: string
	buttonHover: string
}

export type ShellTheme = {
	colors: ShellColors
	/** the prompt, set before the input and before every command */
	prompt: string
	fonts: ShellFonts
	window: WindowColors
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
	window?: Partial<WindowColors>
	container?: CSSProperties
}
