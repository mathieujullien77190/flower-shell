import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { Dict } from "../../types"
import { boxed } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

/**
 * A language the package does not know: nothing lives underneath, so the
 * dictionary must cover the base commands itself. This is the pattern to
 * follow for any other language.
 */
const dictDe: Dict = {
	common: {
		restricted: "Dies ist ein gesperrter Befehl, du kannst ihn nicht benutzen",
	},
	help: {
		desc: "Zeigt Hilfe zu den Befehlen",
		usage: "zeigt Hilfe zu [command]",
		notFound: "Dieser Befehl existiert nicht",
	},
	clear: { usage: "Löscht alles außer dem Verlauf" },
	hello: {
		usage: "Zeigt `Hello world`",
		usageArgs: "Zeigt `Hello [text]`",
		world: "Hallo Welt",
	},
	flowers: { usage: "🌼🌼🌼 Pflanze Blumen 🌼🌼🌼" },
	animation: {
		on: "Schaltet die Animationen ein",
		off: "Schaltet die Animationen aus",
		enabled: "eingeschaltet",
		disabled: "ausgeschaltet",
	},
	test: {
		usage: "Zeigt alle Farben des Themas, geschrieben und gerendert",
		colors: "Farben",
		tags: "Tags",
		invisible: "die Zeile darüber endet mit einem unsichtbaren Wort — markiere es",
	},
	theme: {
		flower: "Das Thema des Pakets: dunkles Laub, eine Blume als Eingabe",
		twilight: "Ein neutrales dunkles Terminal",
		parchment: "Ein neutrales helles Terminal",
		dracula: "Violetter Schiefer, gesättigte Akzente",
		nord: "Nachtblau, kühle Akzente",
		gruvbox: "Erdiger Grund, warme Akzente",
		monokai: "Dunkles Oliv, klare Akzente",
		solarized: "Elfenbein, gedämpfte Akzente",
		set: "Thema: {mode}",
	},
	lang: {
		de: "Zeigt alle Texte auf Deutsch",
		en: "Zeigt alle Texte auf Englisch",
		set: "Sprache: {lang}",
	},
	error: {
		unknown:
			"{name} ist kein interner Befehl, tippe `help` für die Liste der Befehle",
		args: "Argument(e) nicht erkannt",
	},
}

const meta: Meta<typeof Shell> = {
	title: "Shell/German",
	component: Shell,
	decorators: [boxed],
	parameters: prose({
		en: `
A language written outside the package. \`dictDe\` covers the base commands
itself — nothing lives underneath German — and \`lang.de\` is added to the
English dictionary so the help still names it once switched back.

The shell opens on \`help lang\`, which lists exactly what \`dict\` mounts:
German and English, and nothing else.
`,
		fr: `
Une langue écrite hors du paquet. \`dictDe\` couvre les commandes de base
lui-même — rien ne vit sous l'allemand — et \`lang.de\` est ajoutée au
dictionnaire anglais pour que l'aide sache encore la nommer une fois revenu à
l'anglais.

Le shell ouvre sur \`help lang\`, qui liste exactement ce que \`dict\` monte :
l'allemand et l'anglais, rien d'autre.
`,
	}),
}

export default meta

export const German: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands, test } from "flower-shell"
import type { Dict } from "flower-shell"

// the package does not know German: nothing lives underneath, so the
// dictionary must cover the base commands itself. This is the pattern
// to follow for any other language.
const dictDe: Dict = {
	common: { restricted: "Dies ist ein gesperrter Befehl, ..." },
	help: { desc: "...", usage: "...", notFound: "..." },
	clear: { usage: "..." },
	hello: { usage: "...", usageArgs: "...", world: "Hallo Welt" },
	flowers: { usage: "..." },
	animation: { on: "...", off: "...", enabled: "...", disabled: "..." },
	theme: { flower: "...", twilight: "...", parchment: "...", set: "Thema: {mode}" },
	lang: { de: "...", en: "...", set: "Sprache: {lang}" },
	error: { unknown: "...", args: "..." },
}

// help lang opens the shell on the list of what is mounted: de and en
<Shell
	commands={{ ...baseCommands, test }}
	lang="de"
	dict={{
		// the package English does not know German: lang.de is added here,
		// otherwise the lang help shows the bare key once switched to English
		en: { lang: { de: "Shows every text in German" } },
		de: dictDe,
	}}
	initialCommands={["help lang"]}
/>
`),
	args: {
		commands: { ...baseCommands, test },
		lang: "de",
		dict: {
			// the package English does not know German: `lang.de` is added here,
			// otherwise the `lang` help shows the bare key once switched to English
			en: { lang: { de: "Shows every text in German" } },
			de: dictDe,
		},
		initialCommands: ["help lang"],
	},
}
