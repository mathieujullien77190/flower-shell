import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { themes } from "../../theme"
import { dictEn } from "../../i18n/en"
import { dictFr } from "../../i18n/fr"
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
	title: "Shell/Languages",
	component: Shell,
	decorators: [boxed],
	parameters: prose({
		en: `
**The languages of the shell are exactly the keys of \`dict\`** — nothing more.
\`lang\` picks the one it starts on, among those. Both stories below open on
\`help lang\`, which lists what each of them mounts and nothing else.

**French** is the easy case: the package ships \`dictFr\`, you only need to
mount it beside \`dictEn\`, and \`lang fr\` and \`lang en\` both answer.

**German** is the other one, and the pattern for any language the package
does not know. Nothing lives underneath, so \`dictDe\` has to cover the base
commands itself. And \`lang.de\` is added to the English dictionary, otherwise
the help would show that bare key once the visitor switched back to English.
`,
		fr: `
**Les langues du shell sont exactement les clés de \`dict\`** — rien de plus.
\`lang\` choisit celle du départ, parmi celles-là. Les deux stories ci-dessous
ouvrent sur \`help lang\`, qui liste ce que chacune monte, et rien d'autre.

**Le français** est le cas facile : le paquet livre \`dictFr\`, il n'y a qu'à
le monter à côté de \`dictEn\`, et \`lang fr\` comme \`lang en\` répondent.

**L'allemand** est l'autre cas, et le modèle pour toute langue que le paquet
ne connaît pas. Rien ne vit dessous, donc \`dictDe\` doit couvrir les commandes
de base lui-même. Et \`lang.de\` est ajoutée au dictionnaire anglais, sans quoi
l'aide afficherait cette clé nue une fois le visiteur revenu à l'anglais.
`,
	}),
}

export default meta

/** the package ships it: `dictFr` beside `dictEn`, and both answer */
export const French: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands, test, themes, dictEn, dictFr } from "flower-shell"

// the shell's languages are the keys of dict, so both answer:
// lang fr and lang en. help lang lists exactly those.
<Shell
	commands={{ ...baseCommands, test }}
	themes={themes}
	lang="fr"
	dict={{ en: dictEn, fr: dictFr }}
	initialCommands={["help lang"]}
/>
`),
	args: {
		commands: { ...baseCommands, test },
		themes,
		lang: "fr",
		dict: { en: dictEn, fr: dictFr },
		initialCommands: ["help lang"],
	},
}

/** written outside the package: the dictionary covers the base commands */
export const German: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands, test, themes } from "flower-shell"
import type { Dict } from "flower-shell"

// the package does not know German: nothing lives underneath, so the
// dictionary must cover the base commands itself. Every key below has to
// be there — this is the whole surface, and the pattern for any other
// language.
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
		usage: "Zeigt \`Hello world\`",
		usageArgs: "Zeigt \`Hello [text]\`",
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
			"{name} ist kein interner Befehl, tippe \`help\` für die Liste der Befehle",
		args: "Argument(e) nicht erkannt",
	},
}

// help lang opens the shell on the list of what is mounted: de and en
<Shell
	commands={{ ...baseCommands, test }}
	themes={themes}
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
		themes,
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
