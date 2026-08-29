import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * Le theme du paquet : la fleur qui lui donne son nom. Fond de feuillage
 * sombre, et des accents pris au 🌼 lui-meme — jaune de pollen sur ce qui
 * compte, vert de tige sur les commandes, orange de petale sur ce qui est
 * refuse. L'invite est la fleur : c'est la marque, elle se voit a chaque
 * ligne.
 */
export const flowerTheme: ShellTheme = makeTheme({
	prompt: "🌼",
	colors: {
		background: "#1E2A22",
		textColor: "#DCE6D8",
		importantColor: "#FFD25F",
		cmdColor: "#9BD46A",
		restrictedColor: "#E4674B",
		infoColor: "#7FC6D9",
		appColor: "#F2A0C4",
	},
	titleBar: "#ed612e",
	content: "#f4ebda",
})
