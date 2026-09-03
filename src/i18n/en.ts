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
		/**
		 * The hint under the line being typed: {word} is what [TAB] would put
		 * there, {key} the key that takes it — [ENTER] on a phone, which has
		 * no [TAB].
		 */
		predict: "( {word}? press [{key}] )",
	},
	theme: {
		flower: "The package theme: leaf-dark, with a flower for a prompt",
		hibiscus: "Wine dark ground, petal pink and pollen yellow",
		sunflower: "Loam dark ground, petal yellow and summer sky",
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
