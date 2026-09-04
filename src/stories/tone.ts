/** the two ways the documentation is read */
export type Tone = "light" | "dark"

/**
 * The theme picked in the toolbar of Storybook — the documentation's own,
 * not the terminal's.
 *
 * `context.globals` would be the obvious place, and it is the right one on
 * the canvas. It is not on a docs page: a story renders there in a frame of
 * its own whose address carries no globals, so inside it the toolbar choice
 * always reads as the starting one. The frame is reloaded on every change of
 * a global, though, and the address of the page it sits in does carry the
 * choice — `?globals=theme:dark` — so that is where it is read.
 *
 * Storybook leaves the value out of the address when it is the starting one:
 * absent means "whatever the story was mounted with", which is what the
 * fallback answers — the globals of the story for a decorator, plain light
 * for a panel that has none.
 *
 * Wrapped, because the address of the page is not always readable: a
 * Storybook composed into another one is served from elsewhere, and asking
 * throws rather than answering.
 */
export const toolbarTone = (fallback?: unknown): Tone => {
	try {
		const globals = new URLSearchParams(window.top?.location.search).get(
			"globals"
		)
		const named = globals
			?.split(";")
			.find(one => one.startsWith("theme:"))
			?.slice("theme:".length)

		return (named || fallback) === "dark" ? "dark" : "light"
	} catch {
		return fallback === "dark" ? "dark" : "light"
	}
}

/**
 * What a panel of the documentation paints itself with. The terminals have
 * their themes; the forms and the tables around them follow the page, and
 * black on a dark page is what one cannot read.
 */
export const ink = (tone: Tone) =>
	tone === "dark"
		? {
				text: "#e6e6e6",
				border: "rgba(255,255,255,0.25)",
				field: "#1e1e1e",
			}
		: {
				text: "#1b1b1b",
				border: "rgba(0,0,0,0.25)",
				field: "#ffffff",
			}
