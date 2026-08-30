import { BaseCommand } from "@types"
import { t } from "@i18n/lang"

/**
 * Le banc d'essai du balisage : chaque marqueur, sa source a gauche et son
 * rendu a droite. Il ne part pas avec `baseCommands` — c'est un outil de
 * mise au point, pas une commande du visiteur — et se monte a la main :
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

/** les deux antislashs de l'echappement ne comptent pas dans la largeur */
const ESCAPED_WIDTH = Math.max(...MARKS.map(m => m.label.length)) + 2

/**
 * La colonne de gauche, calee sur le plus long libelle. `shown` est la
 * largeur *visible* de la source : les antislashs disparaissent au rendu,
 * elle vaut donc la longueur du rendu. Deux espaces au minimum — la ligne
 * cliquable est plus large que la colonne et collerait sans eux.
 */
const column = (source: string, shown: number) =>
	source + " ".repeat(Math.max(2, ESCAPED_WIDTH + 4 - shown))

/** `\§important\§   §important§` : la source, puis son rendu */
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
 * Le marqueur cliquable, joue pour de vrai : le clic passe par `actionmap`
 * et lance `hello`. La commande visee est ecrite en clair dans la source,
 * seul le libelle se traduit.
 */
const clickLine = () => {
	const label = t("test.click")
	const source = `\\#${label} ~ hello\\#`
	const rendered = `#${label} ~ hello#`

	return `  ${column(source, rendered.length)}${rendered}`
}

export const test: BaseCommand = {
	restricted: false,
	action: () =>
		[
			`§${t("test.colors")}§`,
			...MARKS.map(markLine),
			`  ${t("test.invisible")}`,
			"",
			`§${t("test.tags")}§`,
			// `_` n'a pas de tag : un fond de la couleur du fond ne montre rien
			...MARKS.filter(mark => mark.separator !== "_").map(tagLine),
			"",
			`§${t("test.clicked")}§`,
			clickLine(),
		].join("\n"),
	help: {
		patterns: [{ pattern: "test", description: "test.usage" }],
	},
}
