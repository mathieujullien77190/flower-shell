/**
 * Du texte est selectionne dans la page. Le shell reprend le focus a la
 * moindre occasion, ce qui effacerait la selection du visiteur.
 */
export const hasSelection = (): boolean =>
	typeof window !== "undefined" &&
	Boolean(window.getSelection()?.toString().trim())

export const cleanCommand = (cmd: string) => {
	return cmd
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
}
