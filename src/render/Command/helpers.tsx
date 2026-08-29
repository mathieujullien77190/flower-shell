import React, { ReactNode } from "react"
import reactStringReplace from "react-string-replace"

import { colors } from "@theme"
import uniqid from "uniqid"

/**
 * Echappement facon antislash : `\+` affiche le marqueur tel quel au lieu
 * de colorer. Un antislash sans marqueur derriere reste affiche tel quel,
 * il n'y a donc pas besoin de l'echapper lui-meme.
 */
const ESCAPE = "\\"

/**
 * Le marqueur echappe est range sous un caractere de la zone privee
 * Unicode le temps de la passe de couleur : sans cela il ferait paire
 * avec le marqueur suivant et colorerait tout ce qui les separe.
 */
const hidden = (index: number) => String.fromCharCode(0xe000 + index)

/** protege un caractere pour l'inserer dans une expression reguliere */
const rx = (char: string) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Sur un fond de tag, le texte se lit en blanc ou en noir selon la clarte
 * du fond (luminance relative WCAG). Les couleurs vives du theme sombre
 * appellent du noir, les couleurs assombries du theme clair du blanc.
 */
const readableOn = (hex: string) => {
	const channel = (i: number) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
	}
	const luminance =
		0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5)

	return luminance > 0.45 ? "#1b1b1b" : "#ffffff"
}

export const highlight = (
	text: string,
	onClick: (name: string, arg: string[]) => void
) => {
	let result: string | ReactNode[] = text

	// couleurs lues a chaque rendu : elles suivent le theme courant
	const list: {
		separator: string
		color: string
		command?: string
	}[] = [
		{ separator: "§", color: colors().importantColor },
		{ separator: "+", color: colors().infoColor },
		{ separator: "`", color: colors().cmdColor },
		{ separator: "!", color: colors().restrictedColor },
		{ separator: "$", color: colors().appColor },
		// couleur du fond : le texte se fond dedans, revele a la selection
		{ separator: "_", color: colors().invisible },
		// cliquable : le clic joue la commande `actionmap`
		{ separator: "#", color: colors().importantColor, command: "actionmap" },
	]

	// le libelle affiche, et les arguments passes au clic apres un `~`
	const parse = (raw: string) => {
		if (raw.indexOf("~") === -1) return { label: raw, args: [] as string[] }
		const [label, rest] = raw.split("~")
		// `#libelle ~ commande#` s'ecrit avec des espaces autour du `~` : sans
		// ce trim ils partiraient dans le libelle, et le soulignement du lien
		// depasserait le dernier mot
		return { label: label.trim(), args: rest.trim().split(/\s+/) }
	}

	const mark = (
		item: (typeof list)[number],
		raw: string,
		tag: boolean
	): ReactNode => {
		const { label, args } = parse(raw)
		const style: React.CSSProperties = tag
			? {
					background: item.color,
					color: readableOn(item.color),
					padding: "0 6px",
					borderRadius: 4,
					fontWeight: "bold",
				}
			: { color: item.color }

		// un marqueur cliquable se signale comme un lien
		if (item.command) style.textDecoration = "underline"

		return (
			<span
				key={uniqid()}
				style={{ ...style, cursor: item.command ? "pointer" : undefined }}
				onClick={() => {
					if (item.command) onClick(item.command, args)
				}}
			>
				{label}
			</span>
		)
	}

	// 1) les marqueurs echappes partent en zone privee, hors de portee
	list.forEach((item, index) => {
		result = (result as string)
			.split(`${ESCAPE}${item.separator}`)
			.join(hidden(index))
	})

	// 2) les tags `[<sep>...<sep>]` d'abord : sinon la passe inline mangerait
	//    la paire interne et laisserait les crochets orphelins
	list.forEach(item => {
		const s = rx(item.separator)
		result = reactStringReplace(
			result,
			new RegExp(`\\[${s}([^${s}]*)${s}\\]`, "g"),
			match => mark(item, match, true)
		)
	})

	// 3) les marqueurs inline `<sep>...<sep>`
	list.forEach(item => {
		const s = rx(item.separator)
		result = reactStringReplace(
			result,
			new RegExp(`${s}([^${s}]*)${s}`, "g"),
			match => mark(item, match, false)
		)
	})

	// 4) les marqueurs echappes reprennent leur place, sans style
	list.forEach((item, index) => {
		result = reactStringReplace(result, hidden(index), () => item.separator)
	})

	return result
}
