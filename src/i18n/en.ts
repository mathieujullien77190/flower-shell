import { Dict } from "@types"

export const dictEn: Dict = {
	common: {
		restricted: "This is a restricted command, you cannot use it",
		/** the tone of a theme, put before its description in the help */
		light: "light",
		dark: "dark",
	},
	help: {
		desc: "Provides help about the commands",
		usage: "shows help about [command]",
		notFound: "This command does not exist",
	},
	clear: {
		usage: "Clears everything except the history",
	},
	hello: {
		usage: "Prints `Hello world`",
		usageArgs: "Prints `Hello [text]`",
		world: "Hello world",
	},
	flowers: {
		usage: "🌼🌼🌼 Plant some flowers 🌼🌼🌼",
	},
	animation: {
		on: "Enables animations",
		off: "Disables animations",
		enabled: "enabled",
		disabled: "disabled",
	},
	test: {
		usage: "Shows every color of the theme, written and rendered",
		colors: "colors",
		tags: "tags",
		invisible: "the line above ends with an invisible word — select it",
		clicked: "clickable",
		click: "click to run hello",
	},
	input: {
		/** the field itself, named for whoever cannot see the prompt */
		label: "Command line",
		/**
		 * The hint under the line being typed: {word} is what [TAB] would put
		 * there, {key} the key that takes it — [ENTER] on a phone, which has
		 * no [TAB].
		 */
		predict: "( {word}? press [{key}] )",
	},
	terminal: {
		/**
		 * What a screen reader announces the terminal as. The output is a
		 * log: it reads the answers as they land, and says what it is when
		 * one steps into it.
		 */
		output: "Terminal output",
	},
	font: {
		up: "Makes the text bigger",
		down: "Makes the text smaller",
		reset: "Back to the size of the theme",
		bigger: "bigger",
		smaller: "smaller",
		back: "back to the size of the theme",
	},
	theme: {
		flower: "The package theme: leaf-dark, with a flower for a prompt",
		hibiscus: "Wine dark ground, petal pink and pollen yellow",
		kiwi: "Husk dark ground, flesh green and the ring of the seeds",
		contrast: "Made to be read: white on black, bigger letters",
		maple: "Bark dark ground, the gold and the red of the leaf",
		lavender: "Pale lilac ground, violet and the grey green of the stems",
		rice: "Straw ground, grain gold and the water of the paddy",
		nest: "Shell beige ground, twig brown and egg blue",
		set: "theme: {mode}",
	},
	lang: {
		fr: "Shows every text in French (commands stay in English)",
		en: "Shows every text in English",
		set: "language: {lang}",
	},
	welcome: {
		text: "Welcome to $flower-shell$ — type `help` to list the commands",
	},
	error: {
		unknown:
			"{name} is not recognised as an internal command, type `help` to list the commands",
		args: "unrecognised argument(s)",
	},
}
