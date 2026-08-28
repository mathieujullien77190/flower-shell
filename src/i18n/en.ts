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
	lang: {
		fr: "Shows every text in French (commands stay in English)",
		en: "Shows every text in English",
		es: "Shows every text in Spanish",
		set: "language: {lang}",
	},
	error: {
		unknown:
			"{name} is not recognised as an internal command, type `help` to list the commands",
		args: "unrecognised argument(s)",
	},
}
