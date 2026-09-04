import { BaseCommand } from "@types"
import { t } from "@i18n/lang"

/**
 * The workbench of the markup: every marker, its source on the left and its
 * rendering on the right. It does not ship with `baseCommands` — it is a
 * tuning tool, not a command for the visitor — and is mounted by hand:
 * `commands={{ ...baseCommands, test }}`.
 */
const MARKS: { separator: string; label: string }[] = [
	{ separator: "§", label: "important" },
	{ separator: "+", label: "info" },
	{ separator: "`", label: "command" },
	{ separator: "!", label: "restricted" },
	{ separator: "$", label: "brand" },
	{ separator: "_", label: "invisible" },
]

/** the two backslashes of the escaping do not count in the width */
const ESCAPED_WIDTH = Math.max(...MARKS.map(m => m.label.length)) + 2

/**
 * The left column, set on the longest label. `shown` is the *visible* width
 * of the source: the backslashes disappear at rendering, so it is the
 * length of the rendering. Two spaces at least — the clickable line is
 * wider than the column and would touch it without them.
 */
const column = (source: string, shown: number) =>
	source + " ".repeat(Math.max(2, ESCAPED_WIDTH + 4 - shown))

/** `\§important\§   §important§`: the source, then its rendering */
const markLine = ({ separator, label }: (typeof MARKS)[number]) => {
	const source = `\\${separator}${label}\\${separator}`
	const rendered = `${separator}${label}${separator}`

	return `  ${column(source, rendered.length)}${rendered}`
}

const tagLine = ({ separator, label }: (typeof MARKS)[number]) => {
	const source = `[\\${separator}${label}\\${separator}]`
	const rendered = `[${separator}${label}${separator}]`

	return `  ${column(source, rendered.length)}${rendered}`
}

/**
 * The clickable marker, played for real: the click goes through `actionmap`
 * and runs `hello`. The command it aims at is written out in the source,
 * only the label is translated.
 */
const clickLine = () => {
	const label = t("test.click")
	const source = `\\#${label} ~ hello\\#`
	const rendered = `#${label} ~ hello#`

	return `  ${column(source, rendered.length)}${rendered}`
}

export const testCommand: BaseCommand = {
	restricted: false,
	action: () =>
		[
			`§${t("test.colors")}§`,
			...MARKS.map(markLine),
			`  ${t("test.invisible")}`,
			"",
			`§${t("test.tags")}§`,
			// `_` has no tag: a background the color of the background shows nothing
			...MARKS.filter(mark => mark.separator !== "_").map(tagLine),
			"",
			`§${t("test.clicked")}§`,
			clickLine(),
		].join("\n"),
	help: {
		patterns: [{ pattern: "test", description: "test.usage" }],
	},
}
