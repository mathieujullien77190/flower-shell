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
	test: {
		usage: "Affiche toutes les couleurs du thème, écrites et rendues",
		colors: "couleurs",
		tags: "tags",
		invisible: "la ligne au-dessus finit par un mot invisible — sélectionnez-le",
		clicked: "cliquable",
		click: "cliquez pour jouer hello",
	},
	theme: {
		flower: "Le thème du paquet : feuillage sombre, une fleur pour invite",
		twilight: "Un terminal sombre et neutre",
		parchment: "Un terminal clair et neutre",
		dracula: "Fond ardoise violette, accents saturés",
		nord: "Fond bleu nuit, accents froids et bas en saturation",
		gruvbox: "Fond terreux, accents chauds",
		monokai: "Fond olive sombre, accents francs",
		solarized: "Fond ivoire, accents mesurés",
		set: "thème : {mode}",
	},
	lang: {
		fr: "Affiche tout les textes en français",
		en: "Affiche tout les textes en anglais",
		set: "langage : {lang}",
	},
	welcome: {
		text: "Bienvenue sur $flower-shell$ — tapez `help` pour afficher la liste des commandes",
	},
	error: {
		unknown:
			"{name} n’est pas reconnu en tant que commande interne, tapez `help` pour afficher la liste des commandes",
		args: "argument(s) non reconnu",
	},
}
