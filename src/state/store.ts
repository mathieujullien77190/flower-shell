import { createStore } from "zustand/vanilla"
import type { StoreApi } from "zustand/vanilla"

import { Command } from "@types"
import { DEFAULT_THEME_NAME, setTheme, themeByName } from "@theme"

/** the name of a theme of the catalogue: what the visitor types */
type ThemeName = string

export type ShellState = {
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

/** the store of one shell: every terminal on the page owns one */
export type ShellStore = StoreApi<ShellState>

/** the options a shell can be mounted on, the rest being the defaults */
export type ShellOptions = {
	lang?: string
	animation?: boolean
	keyboardOnFocus?: boolean
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

/**
 * One store per shell, and not one for the module: two terminals on the same
 * page keep their own history, their own cursor and their own options.
 *
 * `reset` goes back to the values the shell was mounted on, not to the ones
 * of the package: a shell opened in German stays German once emptied.
 */
export const createShellStore = (options: ShellOptions = {}): ShellStore => {
	const start = { ...INITIAL, ...clean(options) }

	return createStore<ShellState>(set => ({
		...start,

		reset: () => set(start),

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
}

/** an option left out keeps its default, where `undefined` would erase it */
function clean(options: ShellOptions) {
	return Object.fromEntries(
		Object.entries(options).filter(([, value]) => value !== undefined)
	)
}
