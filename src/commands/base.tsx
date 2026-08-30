import { BaseCommands, Help } from "@types"
import { langs, t } from "@i18n/lang"
import { readHelp } from "@engine/terminalEngine"
import { colors, themeNames } from "@theme"
import { shellActions } from "@state/store"
import { highlightFlower, plantFlowers } from "./flowers"
import { title } from "./title"

/**
 * L'aide d'une commande. Les descriptions sont des clefs : elles passent
 * par `t()` ici, a l'execution, quand la langue courante est connue.
 */
const buildHelp = (help: Help) => {
	const patterns = help.patterns
		.map(item => `\t${item.pattern} : ${t(item.description)}\n`)
		.join("")

	return `${help.description ? t(help.description) : ""}${
		help.patterns.length > 0 ? "\n" : ""
	}${patterns}`
}

const buildAllHelp = (commands: BaseCommands) =>
	Object.entries(commands)
		.filter(
			([name, command]) =>
				!command.restricted && command.help && name !== "help"
		)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(
			([name, command]) =>
				`+${name}+\n${readHelp(command)
					.patterns.map(
						pattern => `\t${pattern.pattern} : ${t(pattern.description)}\n`
					)
					.join("")}\n`
		)
		.join("")

const commandHelp = (commands: BaseCommands, name: string): Help | null =>
	commands[name] ? readHelp(commands[name]) || null : null

/**
 * Le banc d'essai du balisage. Une commande, et tout ce que `highlight`
 * sait faire s'affiche d'un coup : de quoi verifier une palette, ou voir
 * la syntaxe sans ouvrir la documentation.
 *
 * Chaque ligne se lit en deux colonnes — ce qu'on ecrit a gauche, echappe
 * pour rester lisible, ce que ca donne a droite. L'echappement disparait
 * au rendu, la colonne se cale donc sur la largeur affichee et non sur
 * celle de la chaine.
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

const column = (source: string, shown: number) =>
	source + " ".repeat(Math.max(0, ESCAPED_WIDTH + 4 - shown))

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
 * Les commandes fournies avec le shell, indexees par leur nom. Les deux
 * dernieres sont restreintes et cherchees par nom par le moteur : les
 * retirer casserait le rendu d'une commande inconnue.
 */
export const baseCommands: BaseCommands = {
	help: {
		restricted: false,
		action: ({ args, commands }) => {
			if (args.length === 0) return `\n${buildAllHelp(commands)}`

			const select = commandHelp(commands, args[0])
			if (select) return buildHelp(select)

			return t("help.notFound")
		},
		help: {
			description: "help.desc",
			patterns: [{ pattern: "help [command]", description: "help.usage" }],
		},
	},
	clear: {
		restricted: false,
		action: () => "",
		// l'historique est vide, mais la banniere est rejouee juste apres
		effect: () => shellActions().clear(),
		help: {
			patterns: [{ pattern: "clear", description: "clear.usage" }],
		},
	},
	hello: {
		restricted: false,
		action: ({ args }) =>
			args.length === 0 ? t("hello.world") : `Hello ${args.join(" ")}`,
		help: {
			patterns: [
				{ pattern: "hello", description: "hello.usage" },
				{ pattern: "hello [text]", description: "hello.usageArgs" },
			],
		},
	},
	flowers: {
		restricted: false,
		action: () => plantFlowers(),
		display: {
			stylePre: {
				fontSize: "calc(100cqw/60)",
				color: colors().appColor,
				transform: "scaleX(-1)",
				textAlign: "right",
			},
			highlight: text => highlightFlower(text, { fontSize: "calc(100cqw/60)" }),
			reverse: true,
			stepTime: 1,
			stepSize: 1,
		},
		help: {
			patterns: [{ pattern: "flowers", description: "flowers.usage" }],
		},
	},
	animation: {
		restricted: false,
		testArgs: { authorize: ["on", "off"], empty: false },
		action: ({ args }) =>
			args[0] === "on" ? t("animation.enabled") : t("animation.disabled"),
		effect: ({ args }) => shellActions().setAnimation(args[0] === "on"),
		help: {
			patterns: [
				{ pattern: "animation on", description: "animation.on" },
				{ pattern: "animation off", description: "animation.off" },
			],
		},
	},
	theme: {
		restricted: false,
		// les themes sont ceux du catalogue : lus a la frappe, pas ici
		testArgs: { authorize: themeNames, empty: false },
		action: ({ args }) => t("theme.set", { mode: args[0] }),
		// l'effet joue apres l'action : le theme demande est pose ici
		effect: ({ args }) => shellActions().setThemeName(args[0]),
		/**
		 * Une fonction, comme pour `lang` : l'aide liste le catalogue tel
		 * qu'il est au moment ou elle s'affiche. Chaque theme se decrit par
		 * la clef `theme.<nom>`.
		 */
		help: () => ({
			patterns: themeNames().map(name => ({
				pattern: `theme ${name}`,
				description: `theme.${name}`,
			})),
		}),
	},
	test: {
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
			].join("\n"),
		help: {
			patterns: [{ pattern: "test", description: "test.usage" }],
		},
	},
	lang: {
		restricted: false,
		// les langues sont celles du dictionnaire : lues a la frappe, pas ici
		testArgs: { authorize: langs, empty: false },
		// l'effet joue apres l'action : la langue demandee est forcee ici
		action: ({ args }) => t("lang.set", { lang: args[0] }, args[0]),
		effect: ({ args }) => shellActions().setLang(args[0]),
		/**
		 * Une fonction : l'aide liste les langues reellement montees, celles
		 * du dictionnaire du consommateur. Chacune se decrit par la clef
		 * `lang.<code>` — a lui de la fournir pour la sienne, sans quoi la
		 * clef s'affiche telle quelle.
		 */
		help: () => ({
			patterns: langs().map(lang => ({
				pattern: `lang ${lang}`,
				description: `lang.${lang}`,
			})),
		}),
	},
	welcome: {
		restricted: true,
		// une commande comme les autres : son texte est une clef du
		// dictionnaire, que le consommateur recouvre par `dict`
		action: () => t("welcome.text"),
		help: { description: "common.restricted", patterns: [] },
		display: {
			hideCmd: true,
			style: { color: colors().importantColor },
		},
	},
	title: {
		restricted: true,
		action: () => title,
		help: { description: "common.restricted", patterns: [] },
		display: {
			hideCmd: true,
			style: { alignItems: "center" },
			stylePre: { fontSize: "calc(100vw/130)" },
			highlight: text => highlightFlower(text, { fontSize: "calc(100vw/130)" }),
		},
	},
	unknow: {
		restricted: true,
		action: ({ args }) => t("error.unknown", { name: args[0] }),
		help: { description: "common.restricted", patterns: [] },
	},
	argumenterror: {
		restricted: true,
		action: () => t("error.args"),
		help: { description: "common.restricted", patterns: [] },
	},
}
