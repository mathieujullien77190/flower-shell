/**
 * Some text is selected in the page. The shell takes the focus back at the
 * slightest chance, which would wipe out the visitor's selection.
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
