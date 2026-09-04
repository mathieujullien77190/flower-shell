import { CSSProperties, ReactNode } from "react"
import reactStringReplace from "react-string-replace"
import uniqid from "uniqid"

import { colors } from "@theme"

/**
 * The colors of the ASCII art, read off lone letters planted in the drawing:
 * `R…R` is restricted, `I…I` important, and so on. Shared by the two
 * commands that draw — `flowers` plants them at random, `title` carries them
 * written into the logo — hence its place beside `base` rather than in one
 * of the two folders.
 */
export const highlightFlower = (text: string, baseStyles: CSSProperties) => {
	let result: string | ReactNode[] = text

	const list = [
		{ reg: /R(.*)R/g, styles: { color: colors().restrictedColor } },
		{ reg: /S(.*)S/g, styles: { color: colors().restrictedColor } },
		{ reg: /I(.*)I/g, styles: { color: colors().importantColor } },
		{ reg: /B(.*)B/g, styles: { color: colors().infoColor } },
		{ reg: /G(.*)G/g, styles: { color: colors().appColor } },
		{ reg: /T(.*)T/g, styles: { color: colors().restrictedColor } },
		{ reg: /J(.*)J/g, styles: { color: colors().importantColor } },
		{ reg: /H(.*)H/g, styles: { color: colors().appColor } },
		{ reg: /K(.*)K/g, styles: { color: colors().restrictedColor } },
		{ reg: /X(.*)X/g, styles: { color: colors().restrictedColor } },
		{ reg: /D(.*)D/g, styles: { color: colors().appColor } },
		{ reg: /Z(.*)Z/g, styles: { color: colors().infoColor } },
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
