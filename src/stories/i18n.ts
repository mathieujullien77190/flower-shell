import { useContext, useEffect, useState } from "react"
import { DocsContext } from "@storybook/addon-docs/blocks"

/**
 * The language of the documentation. It is not the one of the shell: the
 * terminal has its own, set by the `lang` prop, and a story can perfectly
 * well speak English inside a page read in French.
 */
export const LOCALES = ["en", "fr"] as const

export type Locale = (typeof LOCALES)[number]

/** a documentation text, in both languages */
export type Prose = Record<Locale, string>

/**
 * Anything a panel says, in both languages: the titles of its groups, the
 * head of its table, the line it shows when it has nothing yet. What a
 * button carries is not in there — `run`, `clear`, `lang fr`, `title` are
 * names of the API and of the commands, and they are typed the same in
 * either language.
 */
export type Labels<Text> = Record<Locale, Text>

/**
 * The locale a global names, English if it names none. The toolbar is the
 * only one to set it, but it comes back as an unknown: the globals are a
 * bag of anything.
 */
export const asLocale = (value: unknown): Locale =>
	LOCALES.includes(value as Locale) ? (value as Locale) : "en"

/** what the docs page needs, and what the public type of the context omits */
export type DocsInternals = {
	channel?: {
		on: (event: string, listener: () => void) => void
		off: (event: string, listener: () => void) => void
	}
	primaryStory?: unknown
	getStoryContext?: (story: unknown) => { globals?: Record<string, unknown> }
}

/**
 * The globals as they stand, read off the docs context.
 *
 * `useGlobals` is of no use here: Storybook turns it down outside of a
 * decorator or a story, and a docs page is neither. The URL of the page does
 * not carry them either — the rendering frame does not see it. What is left
 * are the globals of the story context, read on every render.
 *
 * The channel only serves to trigger that render: the value always comes
 * from the reading below, which saves having to guess the shape of what the
 * event carries.
 */
export const useGlobalsFromDocs = (
	context: DocsInternals
): Record<string, unknown> => {
	const [, redraw] = useState(0)

	useEffect(() => {
		const channel = context?.channel
		if (!channel) return

		const refresh = () => redraw(count => count + 1)

		channel.on("globalsUpdated", refresh)
		return () => channel.off("globalsUpdated", refresh)
	}, [context])

	return context?.getStoryContext?.(context.primaryStory)?.globals || {}
}

/**
 * The language of the page, for whoever has words of their own to say in
 * it: the docs page for its prose, a panel for its labels. It lives here
 * rather than in `Docs.tsx` — a panel is rendered by a story, not by the
 * page, and it has no business importing the page to ask.
 */
export const useLocale = (): Locale => {
	const context = useContext(DocsContext) as unknown as DocsInternals
	const globals = useGlobalsFromDocs(context)

	return asLocale(globals.locale)
}

/**
 * The prose of a docs page, set on the `meta`.
 *
 * It cannot stay in a comment above the meta: Storybook extracts those at
 * build time, and a choice made in the toolbar would change nothing there.
 * As a parameter, the docs page reads it at render time and follows the
 * current language.
 *
 * Corollary: the meta loses its comment, and with it the injection of
 * `parameters` the CSF plugin performs on the metas carrying one — that
 * injection is what forbade setting parameters at that level.
 *
 * `controls` opens the table of the props, closed everywhere else: it is
 * the same on all twelve pages, and repeating it drowns the case each one
 * tells. One page carries it, the one you come in through.
 */
export const prose = (text: Prose, options?: { controls?: boolean }) => ({
	docs: { prose: text, controls: options?.controls === true },
})
