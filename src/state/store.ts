import { create } from "zustand"
import { useShallow } from "zustand/react/shallow"

import { Command } from "@types"
import { DEFAULT_THEME_NAME, setTheme, themeByName } from "@theme"

/** the name of a theme of the catalogue: what the visitor types */
type ThemeName = string

type Shell = {
	/** language the texts are rendered in */
	lang: string
	/** letter by letter writing of the answers */
	animation: boolean
	/** the input takes the focus back as soon as it loses it */
	keyboardOnFocus: boolean
	/** the current theme, by its name in the catalogue */
	themeName: ThemeName

	commands: Command[]
	restrictedCommands: Command[]
	/** position in the history, null when on the blank line */
	cursor: number | null

	/** empties the history and puts the options back to their starting values */
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
	cursor: null as number | null,
}

export const useShellStore = create<Shell>(set => ({
	...INITIAL,

	reset: () => set(INITIAL),

	setLang: lang => set({ lang }),
	setAnimation: animation => set({ animation }),
	setKeyboardOnFocus: keyboardOnFocus => set({ keyboardOnFocus }),

	// sets the module theme (colors() will follow) then notes its name: the
	// second triggers the render, the first provides the colors it will read
	// back. An unknown name does nothing: the command does not let it through.
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

	/**
	 * The end of the writing is reported on every render for as long as the
	 * command is on screen, and not only as it happens. Without this early
	 * return, the `map` rebuilt the list and the object on every call: the
	 * state changed identity for an identical value, and the terminal
	 * rendered again, which reported the end again. Marking rendered what
	 * already is changes nothing, and so must wake nothing.
	 */
	setIsRendered: id =>
		set(state => {
			const done = (list: Command[]) =>
				list.some(command => command.id === id && command.isRendered)

			if (done(state.commands) || done(state.restrictedCommands)) return state

			return {
				commands: rendered(state.commands, id),
				restrictedCommands: rendered(state.restrictedCommands, id),
			}
		}),

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
 * The two lists put back in the order they arrived in. The sort goes by
 * `order` and not by `timestamp`: the commands of the opening leave in the
 * same loop and land on the same millisecond, and the sort, being stable,
 * then returned the unrestricted ones before the restricted — `help theme`
 * before `title`, whatever order was asked for.
 *
 * The array is rebuilt on every call, hence useShallow: without it, the new
 * reference would trigger a render on every change of the store, even an
 * unrelated one.
 */
export const useGetCommands = () =>
	useShellStore(
		useShallow(state =>
			[
				...state.commands.filter(command => command.visible),
				...state.restrictedCommands.filter(command => command.visible),
			].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		)
	)

export const useGetCursor = () => useShellStore(state => state.cursor)

export const useGetCurrentCommand = () =>
	useShellStore(state =>
		state.cursor === null ? null : state.commands[state.cursor] || null
	)

/**
 * The startup is over: not one restricted command left waiting to be
 * rendered, and the visitor has not typed anything yet. It is what
 * `initialCommands` plays that fills the first condition, whatever its
 * length.
 */
export const useGetStart = () =>
	useShellStore(
		state =>
			state.restrictedCommands.every(command => command.isRendered) &&
			state.commands.length === 0
	)

/** last command played by the visitor, the restricted ones left out */
export const useGetLastCommand = () =>
	useShellStore(state => state.commands[state.commands.length - 1] || null)

export const useLang = () => useShellStore(state => state.lang)

export const useAnimation = () => useShellStore(state => state.animation)

export const useThemeName = () => useShellStore(state => state.themeName)

export const useKeyboardOnFocus = () =>
	useShellStore(state => state.keyboardOnFocus)

/** outside a component: the commands attack the store directly */
export const shellActions = () => useShellStore.getState()
