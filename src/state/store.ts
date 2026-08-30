import { create } from "zustand"
import { useShallow } from "zustand/react/shallow"

import { Command } from "@types"
import { DEFAULT_THEME_NAME, setTheme, themeByName } from "@theme"

/** le nom d'un theme du catalogue : ce que le visiteur tape */
type ThemeName = string

type Shell = {
	/** langue de rendu des textes */
	lang: string
	/** ecriture lettre par lettre des reponses */
	animation: boolean
	/** la saisie reprend le focus des qu'elle le perd */
	keyboardOnFocus: boolean
	/** le theme courant, par son nom dans le catalogue */
	themeName: ThemeName

	commands: Command[]
	restrictedCommands: Command[]
	/** position dans l'historique, null quand on est sur la ligne vierge */
	cursor: number

	/** vide l'historique et rend les options a leurs valeurs de depart */
	reset: () => void
	setLang: (lang: string) => void
	setAnimation: (animation: boolean) => void
	setKeyboardOnFocus: (keyboardOnFocus: boolean) => void
	setThemeName: (name: ThemeName) => void

	addCommand: (command: Command) => void
	setIsRendered: (id: string) => void
	clear: () => void
	moveCursor: (direction: number) => void
}

const rendered = (list: Command[], id: string) =>
	list.map(command =>
		command.id === id ? { ...command, isRendered: true } : command
	)

const INITIAL = {
	lang: "en",
	animation: true,
	keyboardOnFocus: true,
	themeName: DEFAULT_THEME_NAME as ThemeName,

	commands: [] as Command[],
	restrictedCommands: [] as Command[],
	cursor: null as number,
}

export const useShellStore = create<Shell>(set => ({
	...INITIAL,

	reset: () => set(INITIAL),

	setLang: lang => set({ lang }),
	setAnimation: animation => set({ animation }),
	setKeyboardOnFocus: keyboardOnFocus => set({ keyboardOnFocus }),

	// pose le theme module (colors() suivra) puis note son nom : le second
	// declenche le rendu, le premier fournit les couleurs qu'il relira.
	// Un nom inconnu ne fait rien : la commande ne laisse pas passer.
	setThemeName: name => {
		const next = themeByName(name)
		if (!next) return

		setTheme(next)
		set({ themeName: name })
	},

	addCommand: command =>
		set(state =>
			command.restricted
				? {
						restrictedCommands: [
							...state.restrictedCommands,
							{ ...command, visible: true },
						],
						cursor: null,
				  }
				: {
						commands: [
							...state.commands,
							{ ...command, visible: command.name !== "clear" },
						],
						cursor: null,
				  }
		),

	setIsRendered: id =>
		set(state => ({
			commands: rendered(state.commands, id),
			restrictedCommands: rendered(state.restrictedCommands, id),
		})),

	clear: () =>
		set(state => ({
			commands: state.commands.map(command => ({
				...command,
				visible: false,
			})),
			restrictedCommands: state.restrictedCommands.map(command => ({
				...command,
				visible: false,
			})),
		})),

	moveCursor: direction =>
		set(state => {
			if (state.cursor === null) return { cursor: state.commands.length - 1 }
			if (direction < 0)
				return { cursor: state.cursor < 0 ? -1 : state.cursor + direction }
			if (direction > 0)
				return {
					cursor:
						state.cursor >= state.commands.length
							? state.commands.length
							: state.cursor + direction,
				}
			return {}
		}),
}))

/**
 * Les deux listes remises dans l'ordre d'arrivee. Le tri passe par `order`
 * et non par `timestamp` : les commandes de l'ouverture partent dans la meme
 * boucle et tombent sur la meme milliseconde, et le tri, stable, rendait
 * alors les non restreintes avant les restreintes — `help theme` avant
 * `title`, quel que soit l'ordre demande.
 *
 * Le tableau est reconstruit a chaque appel, d'ou useShallow : sans lui, la
 * nouvelle reference relancerait un rendu a chaque changement du store, meme
 * sans rapport.
 */
export const useGetCommands = () =>
	useShellStore(
		useShallow(state =>
			[
				...state.commands.filter(command => command.visible),
				...state.restrictedCommands.filter(command => command.visible),
			].sort((a, b) => a.order - b.order)
		)
	)

export const useGetCursor = () => useShellStore(state => state.cursor)

export const useGetCurrentCommand = () =>
	useShellStore(state => state.commands[state.cursor] || null)

/**
 * Le demarrage est fini : plus une commande restreinte en attente de rendu,
 * et le visiteur n'a encore rien tape. C'est ce que joue `initialCommands`
 * qui remplit la premiere condition, quelle qu'en soit la longueur.
 */
export const useGetStart = () =>
	useShellStore(
		state =>
			state.restrictedCommands.every(command => command.isRendered) &&
			state.commands.length === 0
	)

/** derniere commande jouee par le visiteur, les restreintes exclues */
export const useGetLastCommand = () =>
	useShellStore(state => state.commands[state.commands.length - 1] || null)

export const useLang = () => useShellStore(state => state.lang)

export const useAnimation = () => useShellStore(state => state.animation)

export const useThemeName = () => useShellStore(state => state.themeName)

export const useKeyboardOnFocus = () =>
	useShellStore(state => state.keyboardOnFocus)

/** hors composant : les commandes attaquent le store directement */
export const shellActions = () => useShellStore.getState()
