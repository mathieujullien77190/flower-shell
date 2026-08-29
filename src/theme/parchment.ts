import { makeTheme } from "./base"
import type { ShellTheme } from "./types"

/**
 * Parchment : le terminal neutre sur clair. Fond parchemin, memes couleurs
 * assombries pour tenir la lisibilite (et servir de fond de tag sous un
 * texte blanc).
 */
export const parchmentTheme: ShellTheme = makeTheme({
	colors: {
		background: "#F5F1E6",
		textColor: "#2A333A",
		importantColor: "#B26A00",
		cmdColor: "#3F7A1E",
		restrictedColor: "#C0392B",
		infoColor: "#1C7FB8",
		appColor: "#5E8A12",
	},
	titleBar: "#ed612e",
	content: "#ffffff",
	border: "#3A3A3A",
	button: "#dddddd",
	buttonHover: "#bbbbbb",
})
