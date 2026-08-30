import { useContext, useEffect, useState } from "react"
import {
	Controls,
	Description,
	DocsContext,
	Markdown,
	Primary,
	Stories,
	Subtitle,
	Title,
	useOf,
} from "@storybook/addon-docs/blocks"

import { LOCALES, type Locale, type Prose } from "./i18n"

type MetaWithProse = {
	preparedMeta?: { parameters?: { docs?: { prose?: Prose } } }
	csfFile?: { stories?: Record<string, unknown> }
}

/** ce dont la page a besoin, et que le type public du contexte ne dit pas */
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
 * La langue de la documentation, prise dans les globals.
 *
 * `useGlobals` ne sert a rien ici : Storybook le refuse hors d'un decorateur
 * ou d'une story, et une page docs n'est ni l'un ni l'autre. L'URL de la
 * page ne les porte pas non plus — le cadre de rendu ne la voit pas. Restent
 * les globals du contexte de la story, lus a chaque rendu.
 *
 * Le canal ne sert qu'a provoquer ce rendu : la valeur, elle, vient toujours
 * de la lecture ci-dessous, ce qui evite d'avoir a deviner la forme de ce
 * que l'evenement transporte.
 */
const useLocale = (): Locale => {
	const context = useContext(DocsContext) as unknown as DocsInternals
	const [, redraw] = useState(0)

	useEffect(() => {
		const channel = context?.channel
		if (!channel) return

		const refresh = () => redraw(count => count + 1)

		channel.on("globalsUpdated", refresh)
		return () => channel.off("globalsUpdated", refresh)
	}, [context])

	const globals = context?.getStoryContext?.(context.primaryStory)?.globals

	return isLocale(globals?.locale) ? globals.locale : "en"
}

/**
 * La page docs de toutes les stories, posee une fois dans `preview.tsx`.
 *
 * Elle ne fait qu'une chose que la page par defaut ne fait pas : lire la
 * prose dans les parametres du meta plutot que dans son commentaire, et y
 * prendre la langue courante. Le reste — le titre, le rendu, la table des
 * props, les autres stories — sont les blocs de Storybook, dans l'ordre ou
 * la page par defaut les pose.
 */
export const DocsPage = () => {
	const locale = useLocale()
	const { preparedMeta, csfFile } = useOf("meta") as MetaWithProse
	const prose = preparedMeta?.parameters?.docs?.prose

	/**
	 * `Primary` rend deja la premiere story. `Stories` les rend toutes, la
	 * premiere comprise — son `includePrimary` vaut vrai par defaut — et une
	 * page d'une seule story l'affichait donc deux fois. Un fichier a story
	 * unique se passe du bloc ; les autres le prennent sans la primaire.
	 */
	const single = Object.keys(csfFile?.stories || {}).length === 1

	return (
		<>
			<Title />
			<Subtitle />
			{prose && <Markdown>{prose[locale] || prose.en}</Markdown>}
			{/* la prose de la story elle-meme, quand elle est seule sur la page */}
			{single && <Description of="story" />}
			<Primary />
			<Controls />
			{!single && <Stories includePrimary={false} />}
		</>
	)
}
