import { BaseCommands, Help } from "@types"
import { langs, t } from "@i18n/lang"
import { readHelp } from "@engine/terminalEngine"
import { runHere } from "@engine/send"
import { colors, themeByName, themeNames, themeTone } from "@theme"
import { shellActions } from "@state/instance"
import { highlightFlower, plantFlowers } from "./flowers"
import { title } from "./title"

/**
 * The size of the ascii logo, taken off the width of the terminal and not
 * off the one of the browser: `cqw` is measured on the container of the
 * shell, which sets `container-type: inline-size`. In `vw` the logo stayed
 * sized for the page and overflowed any frame smaller than it — a window, a
 * column, a story.
 *
 * The divider is the one of the drawing: it is about 130 characters wide
 * once its color markers have been consumed.
 */
const LOGO_SIZE = "calc(100cqw / 130)"

/**
 * The help of a command. The descriptions are keys: they go through `t()`
 * here, at execution, when the current language is known.
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
		.flatMap(([name, command]) =>
			command && !command.restricted && command.help && name !== "help"
				? [{ name, help: readHelp(command) }]
				: []
		)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(
			({ name, help }) =>
				`+${name}+\n${(help?.patterns ?? [])
					.map(pattern => `\t${pattern.pattern} : ${t(pattern.description)}\n`)
					.join("")}\n`
		)
		.join("")

const commandHelp = (commands: BaseCommands, name: string): Help | null => {
	const command = commands[name]
	return command ? readHelp(command) || null : null
}

/**
 * The commands shipped with the shell, indexed by their name. The last two
 * are restricted and looked up by name by the engine: removing them would
 * break the rendering of an unknown command.
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
		// the history is empty, but the banner is played again right after
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
	font: {
		restricted: false,
		testArgs: { authorize: ["+", "-", "reset"], empty: false },
		/**
		 * It announces the move and not the size it lands on: the action runs
		 * before the effect, so the number it could name would be the one it
		 * is leaving. The eye reads the answer at its new size anyway.
		 */
		action: ({ args }) =>
			args[0] === "+"
				? t("font.bigger")
				: args[0] === "-"
					? t("font.smaller")
					: t("font.back"),
		effect: ({ args }) => {
			if (args[0] === "reset") shellActions().resetFont()
			else shellActions().zoomFont(args[0] === "+" ? 1 : -1)
		},
		help: {
			patterns: [
				// the plus is escaped: it is a marker of the markup, and a bare
				// one here would pair with the `+name+` the help puts around
				// every command, coloring everything in between
				{ pattern: "font \\+", description: "font.up" },
				{ pattern: "font -", description: "font.down" },
				{ pattern: "font reset", description: "font.reset" },
			],
		},
	},
	theme: {
		restricted: false,
		// the themes are those of the catalogue: read as it is typed, not here
		testArgs: { authorize: themeNames, empty: false },
		action: ({ args }) => t("theme.set", { mode: args[0] }),
		// the effect plays after the action: the requested theme is set here
		effect: ({ args }) => shellActions().setThemeName(args[0]),
		/**
		 * A function, as for `lang`: the help lists the catalogue as it is at
		 * the moment it is shown. Each theme describes itself through the key
		 * `theme.<name>`.
		 *
		 * Its tone comes first — `light : …`, `dark : …` — read off its
		 * background and not off a word in the description: it is what one
		 * looks for in that list, and a theme of the consumer's answers for
		 * it like the others. Translated here, because the description is
		 * handed over already written; a background the tone cannot be read
		 * from leaves the line as it was.
		 */
		help: () => ({
			patterns: themeNames().map(name => {
				const tone = themeTone(themeByName(name))
				const description = t(`theme.${name}`)

				return {
					pattern: `theme ${name}`,
					description: tone
						? `${t(`common.${tone}`)} : ${description}`
						: description,
				}
			}),
		}),
	},
	lang: {
		restricted: false,
		// the languages are those of the dictionary: read as it is typed, not here
		testArgs: { authorize: langs, empty: false },
		// the effect plays after the action: the requested language is forced here
		action: ({ args }) => t("lang.set", { lang: args[0] }, args[0]),
		effect: ({ args }) => shellActions().setLang(args[0]),
		/**
		 * A function: the help lists the languages actually mounted, those of
		 * the consumer's dictionary. Each one describes itself through the key
		 * `lang.<code>` — up to them to provide it for theirs, or the key
		 * shows up as it is.
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
		// a command like the others: its text is a key of the dictionary,
		// which the consumer covers through `dict`
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
			stylePre: { fontSize: LOGO_SIZE },
			highlight: text => highlightFlower(text, { fontSize: LOGO_SIZE }),
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
	/**
	 * The switchboard of the clickable markers. `#label ~ cmd args#` sends
	 * `actionmap cmd args`: the command shows nothing, its effect plays the
	 * line it aims at. Without it a click would do nothing — this is what
	 * makes the marker usable without writing anything.
	 */
	actionmap: {
		restricted: true,
		action: () => "",
		effect: ({ args = [] }) => runHere(args.join(" ")),
		display: { hideCmd: true },
	},
}
