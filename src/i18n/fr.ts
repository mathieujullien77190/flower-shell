import { Dict } from "@types"

export const dictFr: Dict = {
	common: {
		restricted:
			"Ceci est une commande à accès restreint, vous ne pouvez pas l'utiliser",
	},
	help: {
		desc: "Fournit des informations d’aide sur les commandes",
		usage: "affiche des informations d’aide sur [command]",
		notFound: "Cette commande n’existe pas",
	},
	clear: {
		usage: "Efface tout sauf l'historique",
	},
	hello: {
		usage: "Affiche `Hello world`",
		usageArgs: "Affiche `Hello [text]`",
		world: "Hello le monde",
	},
	flowers: {
		usage: "🌼🌼🌼 Plantez des fleurs 🌼🌼🌼",
	},
	animation: {
		on: "Active les animations",
		off: "Désactive les animations",
		enabled: "activé",
		disabled: "désactivé",
	},
	lang: {
		fr: "Affiche tout les textes en français (attention les commandes restent en anglais)",
		en: "Affiche tout les textes en anglais",
		es: "Affiche tout les textes en espagnol",
		set: "langage : {lang}",
	},
	error: {
		unknown:
			"{name} n’est pas reconnu en tant que commande interne, tapez `help` pour afficher la liste des commandes",
		args: "argument(s) non reconnu",
	},
}
