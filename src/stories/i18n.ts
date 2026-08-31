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
