import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../../Shell"
import { baseCommands } from "../../../commands/base"
import { testCommand as test } from "../../../commands/common/test"
import { flowerTheme } from "../../../theme"
import { dictEn } from "../../../i18n/en"
import { dictFr } from "../../../i18n/fr"
import { Dict } from "../../../types"
import { boxed } from "../../decorators"
import { prose } from "../../i18n"
import { source } from "../../source"
import en from "./Languages.en.md?raw"
import fr from "./Languages.fr.md?raw"
import frenchCode from "./French.source.md?raw"
import germanCode from "./German.source.md?raw"

/**
 * A language the package does not know: nothing lives underneath, so the
 * dictionary must cover the base commands itself. This is the pattern to
 * follow for any other language.
 *
 * Only `theme.flower` is described here, because only `flower` is mounted: a
 * theme that cannot be reached has no help line to translate.
 */
const dictDe: Dict = {
	common: {
		restricted: "Dies ist ein gesperrter Befehl, du kannst ihn nicht benutzen",
		light: "hell",
		dark: "dunkel",
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
		invisible:
			"die Zeile darüber endet mit einem unsichtbaren Wort — markiere es",
		clicked: "klickbar",
		click: "klicken, um hello zu spielen",
	},
	input: {
		label: "Befehlszeile",
		predict: "( {word}? drücke [{key}] )",
	},
	terminal: {
		output: "Terminalausgabe",
	},
	font: {
		up: "Vergrößert den Text",
		down: "Verkleinert den Text",
		reset: "Zurück zur Größe des Themas",
		bigger: "größer",
		smaller: "kleiner",
		back: "zurück zur Größe des Themas",
	},
	theme: {
		flower: "Das Thema des Pakets: dunkles Laub, eine Blume als Eingabe",
		set: "Thema: {mode}",
	},
	welcome: {
		text: "Willkommen bei $flower-shell$ — tippe `help` für die Liste der Befehle",
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
	title: "Shell/Languages",
	component: Shell,
	decorators: [boxed],
	parameters: prose({ en, fr }),
}

export default meta

/** the package ships it: `dictFr` beside `dictEn`, and both answer */
export const French: StoryObj<typeof Shell> = {
	parameters: source(frenchCode),
	args: {
		commands: { ...baseCommands, test },
		themes: { flower: flowerTheme },
		lang: "fr",
		dict: { en: dictEn, fr: dictFr },
		initialCommands: ["help lang"],
	},
}

/** written outside the package: the dictionary covers the base commands */
export const German: StoryObj<typeof Shell> = {
	parameters: source(germanCode),
	args: {
		commands: { ...baseCommands, test },
		themes: { flower: flowerTheme },
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
