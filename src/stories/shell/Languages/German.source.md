```tsx
import { Shell, baseCommands, test, flowerTheme } from "flower-shell"
import type { Dict } from "flower-shell"

// the package does not know German: nothing lives underneath, so the
// dictionary must cover the base commands itself. Every key below has to
// be there — this is the whole surface, and the pattern for any other
// language. Only theme.flower is described, because only flower is
// mounted: a theme that cannot be reached has no help line to translate.
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
		invisible: "die Zeile darüber endet mit einem unsichtbaren Wort — markiere es",
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

// help lang opens the shell on the list of what is mounted: de and en
<Shell
	commands={{ ...baseCommands, test }}
	themes={{ flower: flowerTheme }}
	lang="de"
	dict={{
		// the package English does not know German: lang.de is added here,
		// otherwise the lang help shows the bare key once switched to English
		en: { lang: { de: "Shows every text in German" } },
		de: dictDe,
	}}
	initialCommands={["help lang"]}
/>
```
