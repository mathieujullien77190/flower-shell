import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { Dict } from "../../types"
import { boxed } from "../decorators"
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
	theme: {
		flower: "Das Thema des Pakets: dunkles Laub, eine Blume als Eingabe",
		dark: "Ein neutrales dunkles Terminal",
		light: "Ein neutrales helles Terminal",
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
}

export default meta

export const German: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands } from "flower-shell"
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
	theme: { flower: "...", dark: "...", light: "...", set: "Thema: {mode}" },
	lang: { de: "...", en: "...", set: "Sprache: {lang}" },
	error: { unknown: "...", args: "..." },
}

<Shell
	commands={baseCommands}
	lang="de"
	dict={{
		// the package English does not know German: lang.de is added here,
		// otherwise the lang help shows the bare key once switched to English
		en: { lang: { de: "Shows every text in German" } },
		de: dictDe,
	}}
/>
`),
	args: {
		commands: baseCommands,
		lang: "de",
		dict: {
			// the package English does not know German: `lang.de` is added here,
			// otherwise the `lang` help shows the bare key once switched to English
			en: { lang: { de: "Shows every text in German" } },
			de: dictDe,
		},
	},
}
