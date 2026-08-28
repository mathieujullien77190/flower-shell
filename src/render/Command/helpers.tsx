import React, { ReactNode } from "react"
import reactStringReplace from "react-string-replace"

import { colors } from "@theme"
import uniqid from "uniqid"

/**
 * Echappement : un marqueur precede de £ s'affiche tel quel au lieu de
 * colorer. Le caractere ne sert a rien d'autre dans les textes du
 * terminal, il n'y a donc pas besoin de l'echapper lui-meme.
 */
const ESCAPE = "£"

/**
 * Le marqueur echappe est range sous un caractere de la zone privee
 * Unicode le temps de la passe de couleur : sans cela il ferait paire
 * avec le marqueur suivant et colorerait tout ce qui les separe.
 */
const hidden = (index: number) => String.fromCharCode(0xe000 + index)

export const highlight = (
	text: string,
	onClick: (name: string, arg: string[]) => void
) => {
	let result: string | ReactNode[] = text

	const list: {
		separator: string
		styles: React.CSSProperties
		command?: string
	}[] = [
		{
			separator: "§",
			styles: { color: colors().importantColor },
		},
		{
			separator: "+",
			styles: { color: colors().infoColor },
		},
		{
			separator: "#",
			styles: { color: colors().importantColor, cursor: "pointer" },
			command: "actionmap",
		},
		{
			separator: "$",
			styles: {
				background: colors().appColor,
				color: "black",
				border: "solid 1px solid",
				padding: "0 5px",
				fontWeight: "bold",
			},
		},
		// { separator: "-", styles: { textDecoration: "line-through" } },
	]

	list.forEach((item, index) => {
		result = (result as string)
			.split(`${ESCAPE}${item.separator}`)
			.join(hidden(index))
	})

	list.forEach(item => {
		result = reactStringReplace(
			result,
			new RegExp(
				`\\${item.separator}([^\\${item.separator}]*)\\${item.separator}`,
				"g"
			),
			match => {
				let replace = match
				let arg = []

				if (match.indexOf("~") !== -1) {
					replace = match.split("~")[0]
					arg = match.split("~")[1].split(" ")
				}

				return (
					<span
						key={uniqid()}
						style={{
							...item.styles,
						}}
						onClick={() => {
							if (item.command) onClick(item.command, arg)
						}}
					>
						{replace}
					</span>
				)
			}
		)
	})

	// les marqueurs echappes reprennent leur place, sans couleur
	list.forEach((item, index) => {
		result = reactStringReplace(result, hidden(index), () => item.separator)
	})

	return result
}
