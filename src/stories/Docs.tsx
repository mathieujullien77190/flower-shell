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
 * Le conteneur de la page docs, pose avec elle dans `preview.tsx`.
 *
 * Il ne sert qu'a passer un theme a celui de Storybook. Le manager a le
 * sien, repose par `manager.ts` ; la page docs vit dans l'autre document
 * et lit le meme global de son cote, sans quoi la barre laterale
 * changerait de couleur et la page resterait blanche.
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

	// la table des props est la meme sur toutes les pages : une seule la
	// porte, les autres restent sur ce qu'elles ont a montrer
	const controls = preparedMeta?.parameters?.docs?.controls === true

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
			{controls && <Controls />}
			{!single && <Stories includePrimary={false} />}
		</>
	)
}
