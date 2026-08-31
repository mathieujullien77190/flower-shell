import { useContext, useEffect, useState } from "react"
import {
	Controls,
	Description,
	DocsContainer,
	DocsContext,
	Markdown,
	Primary,
	Stories,
	Subtitle,
	Title,
	useOf,
} from "@storybook/addon-docs/blocks"
import { themes } from "storybook/theming"

import { LOCALES, type Locale, type Prose } from "./i18n"

type MetaWithProse = {
	preparedMeta?: {
		parameters?: { docs?: { prose?: Prose; controls?: boolean } }
	}
	csfFile?: { stories?: Record<string, unknown> }
}

/** what the page needs, and what the public type of the context omits */
type DocsInternals = {
	channel?: {
		on: (event: string, listener: () => void) => void
		off: (event: string, listener: () => void) => void
	}
	primaryStory?: unknown
	getStoryContext?: (story: unknown) => { globals?: Record<string, unknown> }
}

const isLocale = (value: unknown): value is Locale =>
	LOCALES.includes(value as Locale)

/**
 * The language of the documentation, taken from the globals.
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
const useGlobalsFromDocs = (
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

const useLocale = (): Locale => {
	const context = useContext(DocsContext) as unknown as DocsInternals
	const globals = useGlobalsFromDocs(context)

	return isLocale(globals.locale) ? globals.locale : "en"
}

/**
 * The container of the docs page, set alongside it in `preview.tsx`.
 *
 * It only serves to hand a theme to Storybook's own. The manager has its
 * own, set again by `manager.ts`; the docs page lives in the other document
 * and reads the same global on its side, or the sidebar would change color
 * and the page would stay white.
 */
export const Container = ({
	context,
	children,
}: {
	context: unknown
	children: React.ReactNode
}) => {
	const globals = useGlobalsFromDocs(context as DocsInternals)
	const theme = globals.theme === "dark" ? themes.dark : themes.light

	return (
		<DocsContainer context={context as never} theme={theme}>
			{children as never}
		</DocsContainer>
	)
}

/**
 * The docs page of every story, set once in `preview.tsx`.
 *
 * It does one thing the default page does not: read the prose in the
 * parameters of the meta rather than in its comment, and take the current
 * language from there. The rest — the title, the render, the table of the
 * props, the other stories — are Storybook's own blocks, in the order the
 * default page lays them out.
 */
export const DocsPage = () => {
	const locale = useLocale()
	const { preparedMeta, csfFile } = useOf("meta") as MetaWithProse
	const prose = preparedMeta?.parameters?.docs?.prose

	// the table of the props is the same on every page: one alone carries
	// it, the others stay on what they have to show
	const controls = preparedMeta?.parameters?.docs?.controls === true

	/**
	 * `Primary` already renders the first story. `Stories` renders them all,
	 * the first one included — its `includePrimary` is true by default — so a
	 * page with a single story showed it twice. A file with one story does
	 * without the block; the others take it without the primary.
	 */
	const single = Object.keys(csfFile?.stories || {}).length === 1

	return (
		<>
			<Title />
			<Subtitle />
			{prose && <Markdown>{prose[locale] || prose.en}</Markdown>}
			{/* the prose of the story itself, when it is alone on the page */}
			{single && <Description of="story" />}
			<Primary />
			{controls && <Controls />}
			{!single && <Stories includePrimary={false} />}
		</>
	)
}
