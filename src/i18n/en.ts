import { Dict } from "@types"

export const dictEn: Dict = {
	common: {
		restricted: "This is a restricted command, you cannot use it",
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
	theme: {
		flower: "The package theme: leaf-dark, with a flower for a prompt",
		twilight: "A neutral dark terminal",
		parchment: "A neutral light terminal",
		dracula: "Slate purple ground, saturated accents",
		nord: "Night blue ground, cool low-saturation accents",
		gruvbox: "Earthy ground, warm accents",
		monokai: "Dark olive ground, blunt accents",
		solarized: "Ivory ground, measured accents",
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
