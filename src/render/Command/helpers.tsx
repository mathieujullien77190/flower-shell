import React, { ReactNode } from "react"
import reactStringReplace from "react-string-replace"

import { colors } from "@theme"
import uniqid from "uniqid"

/**
 * Backslash style escaping: `\+` shows the marker as it is instead of
 * coloring. A backslash with no marker behind it stays on screen as it is,
 * so there is no need to escape it in turn.
 */
const ESCAPE = "\\"

/**
 * The escaped marker is put away under a character of the Unicode private
 * area for the time of the coloring pass: without that it would pair up
 * with the next marker and color everything between them.
 */
const hidden = (index: number) => String.fromCharCode(0xe000 + index)

/** protects a character so it can go into a regular expression */
const rx = (char: string) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * On the background of a tag, the text reads white or black depending on
 * how light the background is (WCAG relative luminance). The bright colors
 * of the dark theme call for black, the darkened colors of the light theme
 * for white.
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

	// colors read on every render: they follow the current theme
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
		// color of the background: the text blends in, revealed by selecting it
		{ separator: "_", color: colors().invisible },
		// clickable: the click plays the `actionmap` command
		{ separator: "#", color: colors().importantColor, command: "actionmap" },
	]

	// the label on screen, and the arguments passed to the click after a `~`
	const parse = (raw: string) => {
		if (raw.indexOf("~") === -1) return { label: raw, args: [] as string[] }
		const [label, rest] = raw.split("~")
		// `#label ~ command#` is written with spaces around the `~`: without
		// this trim they would end up in the label, and the underline of the
		// link would run past the last word
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

		// a clickable marker announces itself as a link
		if (item.command) style.textDecoration = "underline"

		const play = () => {
			if (item.command) onClick(item.command, args)
		}

		return (
			<span
				key={uniqid()}
				style={{ ...style, cursor: item.command ? "pointer" : undefined }}
				/*
				 * A clickable marker is a button, and says so: without a role
				 * and a place in the tab order it could only be reached with a
				 * mouse — invisible to the keyboard, and unnamed to a screen
				 * reader. [ENTER] and [SPACE] play it, the way a button does.
				 */
				role={item.command ? "button" : undefined}
				tabIndex={item.command ? 0 : undefined}
				onClick={play}
				onKeyDown={event => {
					if (!item.command) return
					if (event.key !== "Enter" && event.key !== " ") return

					// [SPACE] scrolls the page otherwise, and the terminal is a
					// scroll box of its own
					event.preventDefault()
					play()
				}}
			>
				{label}
			</span>
		)
	}

	// 1) the escaped markers go off to the private area, out of reach
	list.forEach((item, index) => {
		result = (result as string)
			.split(`${ESCAPE}${item.separator}`)
			.join(hidden(index))
	})

	// 2) the tags `[<sep>...<sep>]` first: otherwise the inline pass would eat
	//    the inner pair and leave the brackets orphaned
	list.forEach(item => {
		const s = rx(item.separator)
		result = reactStringReplace(
			result,
			new RegExp(`\\[${s}([^${s}]*)${s}\\]`, "g"),
			match => mark(item, match, true)
		)
	})

	// 3) the inline markers `<sep>...<sep>`
	list.forEach(item => {
		const s = rx(item.separator)
		result = reactStringReplace(
			result,
			new RegExp(`${s}([^${s}]*)${s}`, "g"),
			match => mark(item, match, false)
		)
	})

	// 4) the escaped markers take their place back, with no style
	list.forEach((item, index) => {
		result = reactStringReplace(result, hidden(index), () => item.separator)
	})

	return result
}
