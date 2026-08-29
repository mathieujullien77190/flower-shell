import { create } from "zustand"
import { useShallow } from "zustand/react/shallow"

import { Command } from "@types"
import { getBanner } from "./registry"
import { darkTheme, lightTheme, setTheme } from "@theme"

type ThemeMode = "light" | "dark"

type Shell = {
	/** langue de rendu des textes */
	lang: string
	/** ecriture lettre par lettre des reponses */
	animation: boolean
	/** la saisie reprend le focus des qu'elle le perd */
	keyboardOnFocus: boolean
	/** le theme livre avec le paquet, sombre ou clair */
	themeMode: ThemeMode

	commands: Command[]
	restrictedCommands: Command[]
	/** position dans l'historique, null quand on est sur la ligne vierge */
	cursor: number

	/** vide l'historique et rend les options a leurs valeurs de depart */
	reset: () => void
	setLang: (lang: string) => void
	setAnimation: (animation: boolean) => void
	setKeyboardOnFocus: (keyboardOnFocus: boolean) => void
	setThemeMode: (mode: ThemeMode) => void

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
	themeMode: "dark" as ThemeMode,

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

	// pose le theme module (colors() suivra) puis note le mode : le second
	// declenche le rendu, le premier fournit les couleurs qu'il relira
	setThemeMode: mode => {
		setTheme(mode === "light" ? lightTheme : darkTheme)
		set({ themeMode: mode })
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
 * Les deux listes remises dans l'ordre. Le tableau est reconstruit a chaque
 * appel, d'ou useShallow : sans lui, la nouvelle reference relancerait un
 * rendu a chaque changement du store, meme sans rapport.
 */
export const useGetCommands = () =>
	useShellStore(
		useShallow(state =>
			[
				...state.commands.filter(command => command.visible),
				...state.restrictedCommands.filter(command => command.visible),
			].sort((a, b) => a.timestamp - b.timestamp)
		)
	)

export const useGetCursor = () => useShellStore(state => state.cursor)

export const useGetCurrentCommand = () =>
	useShellStore(state => state.commands[state.cursor] || null)

/**
 * Le demarrage est fini : toute la banniere est rendue et le visiteur n'a
 * encore rien tape. Le compte vient de la banniere elle-meme, elle est
 * posee par le consommateur et peut avoir n'importe quelle longueur.
 */
export const useGetStart = () =>
	useShellStore(state => {
		const expected = getBanner().length
		const done = state.restrictedCommands.filter(
			command => command.isRendered
		).length

		return done >= expected && state.commands.length === 0
	})

/** derniere commande jouee par le visiteur, les restreintes exclues */
export const useGetLastCommand = () =>
	useShellStore(state => state.commands[state.commands.length - 1] || null)

export const useLang = () => useShellStore(state => state.lang)

export const useAnimation = () => useShellStore(state => state.animation)

export const useThemeMode = () => useShellStore(state => state.themeMode)

export const useKeyboardOnFocus = () =>
	useShellStore(state => state.keyboardOnFocus)

/** hors composant : les commandes attaquent le store directement */
export const shellActions = () => useShellStore.getState()
