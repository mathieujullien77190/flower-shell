import { CSSProperties } from "react"

import type { ShellColors, ShellFonts, ShellTheme } from "./types"

/**
 * Le terminal respire : sans cette marge, la sortie et la saisie collent
 * aux bords de ce qui contient le shell.
 */
export const baseContainer: CSSProperties = {
	padding: "16px",
}

/** memes polices pour tous les themes : un terminal veut du chasse fixe */
export const baseFonts: ShellFonts = {
	shell: "monospace",
	window: "monospace",
}

/**
 * Un theme se resume a sa palette. Le reste ne varie pas — memes polices,
 * meme marge — et le cadre de fenetre tient en deux couleurs. Ecrire les
 * huit themes au complet aurait recopie la meme trentaine de lignes.
 */
export const makeTheme = ({
	colors,
	prompt = ">",
	titleBar,
	content,
	border = "#000000",
	button = "lightGray",
	buttonHover = "gray",
}: {
	/** `invisible` en moins : il vaut toujours le fond */
	colors: Omit<ShellColors, "invisible">
	prompt?: string
	/** la barre de titre du cadre : l'accent du theme */
	titleBar: string
	/** le fond derriere le contenu du cadre, visible autour de lui */
	content: string
	border?: string
	button?: string
	buttonHover?: string
}): ShellTheme => ({
	// un texte pose sur `invisible` se fond dans le fond, revele a la selection
	colors: { ...colors, invisible: colors.background },
	prompt,
	fonts: baseFonts,
	container: baseContainer,
	window: { titleBar, border, content, text: "#000000", button, buttonHover },
})
