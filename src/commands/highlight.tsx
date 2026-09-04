import { CSSProperties, ReactNode } from "react"
import reactStringReplace from "react-string-replace"
import uniqid from "uniqid"

import { colors } from "@theme"
import type { ShellColors } from "@theme"

/**
 * The colors of the ASCII art, read off lone letters planted in the drawing:
 * `R…R` is restricted, `I…I` important, and so on. Shared by the two
 * commands that draw — `flowers` plants them at random, `title` carries them
 * written into the logo — hence its place beside `base` rather than in one
 * of the two folders.
 */
export const highlightFlower = (
	text: string,
	baseStyles: CSSProperties,
	/**
	 * The palette it paints with — the theme of the terminal rendering it.
	 * Given none, the theme in play, which is the one of the page.
	 */
	palette: ShellColors = colors()
) => {
	let result: string | ReactNode[] = text

	const list = [
		{ reg: /R(.*)R/g, styles: { color: palette.restrictedColor } },
		{ reg: /S(.*)S/g, styles: { color: palette.restrictedColor } },
		{ reg: /I(.*)I/g, styles: { color: palette.importantColor } },
		{ reg: /B(.*)B/g, styles: { color: palette.infoColor } },
		{ reg: /G(.*)G/g, styles: { color: palette.appColor } },
		{ reg: /T(.*)T/g, styles: { color: palette.restrictedColor } },
		{ reg: /J(.*)J/g, styles: { color: palette.importantColor } },
		{ reg: /H(.*)H/g, styles: { color: palette.appColor } },
		{ reg: /K(.*)K/g, styles: { color: palette.restrictedColor } },
		{ reg: /X(.*)X/g, styles: { color: palette.restrictedColor } },
		{ reg: /D(.*)D/g, styles: { color: palette.appColor } },
		{ reg: /Z(.*)Z/g, styles: { color: palette.infoColor } },
	]

	list.forEach(item => {
		result = reactStringReplace(result, item.reg, match => (
			<span
				key={uniqid()}
				style={{
					...item.styles,
					...baseStyles,
				}}
			>
				{match}
			</span>
		))
	})

	return result
}
