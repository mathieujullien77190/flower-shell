import { createStore } from "zustand/vanilla"
import type { StoreApi } from "zustand/vanilla"

import { Command } from "@types"
import { DEFAULT_THEME_NAME, fonts, setTheme, themeByName } from "@theme"

/** the name of a theme of the catalogue: what the visitor types */
type ThemeName = string

/** what a shell holds: plain values, no behaviour */
export type ShellData = {
	/** language the texts are rendered in */
	lang: string
	/** letter by letter writing of the answers */
	animation: boolean
	/** the input takes the focus back as soon as it loses it */
	keyboardOnFocus: boolean
	/** the current theme, by its name in the catalogue */
	themeName: ThemeName
	/**
	 * The size of the text, in pixels, when the visitor has set one. `null`
	 * on the size the theme carries — which is the point: a shell that has
	 * not been zoomed follows its theme, including when the theme changes.
	 */
	fontSize: number | null

	commands: Command[]
	restrictedCommands: Command[]
	/** position in the history, null when on the blank line */
	cursor: number | null
}

/** the only ways that state moves */
export type ShellActions = {
	/** empties the history and puts the options back to their starting values */
	reset: () => void
	setLang: (lang: string) => void
	setAnimation: (animation: boolean) => void
	setKeyboardOnFocus: (keyboardOnFocus: boolean) => void
	setThemeName: (name: ThemeName) => void
	/** grows the text one step, or shrinks it: `1` and `-1` */
	zoomFont: (direction: number) => void
	/** back to the size of the theme */
	resetFont: () => void

	addCommand: (command: Command) => void
	setIsRendered: (id: string) => void
	clear: () => void
	moveCursor: (direction: number) => void
}

/** what the handle of a shell hands back: its values and its actions */
export type ShellState = ShellData & ShellActions

/** the store of one shell: every terminal on the page owns one */
export type ShellStore = StoreApi<ShellState>

/** the options a shell can be mounted on, the rest being the defaults */
export type ShellOptions = {
	lang?: string
	animation?: boolean
	keyboardOnFocus?: boolean
}

const DEFAULTS: ShellData = {
	lang: "en",
	animation: true,
	keyboardOnFocus: true,
	themeName: DEFAULT_THEME_NAME,
	fontSize: null,

	commands: [],
	restrictedCommands: [],
	cursor: null,
}

/** an option left out keeps its default, where `undefined` would erase it */
export const initialData = (options: ShellOptions = {}): ShellData => ({
	...DEFAULTS,
	...Object.fromEntries(
		Object.entries(options).filter(([, value]) => value !== undefined)
	),
})

/**
 * What a step of zoom is worth, and how far it goes. The bounds are read
 * ones: under 10 pixels a terminal is a texture, over 40 a line of ASCII art
 * no longer fits the screen it was drawn for.
 */
const FONT_STEP = 2
const FONT_MIN = 10
const FONT_MAX = 40

const rendered = (list: Command[], id: string) =>
	list.map(command =>
		command.id === id ? { ...command, isRendered: true } : command
	)

/**
 * The actions of one shell, written against an `update` that hands them the
 * values as they stand and takes the next ones back. Who holds those values
 * and what a change wakes up is not their business — that is the instance's.
 *
 * `start` is what `reset` goes back to: the values the shell was mounted on,
 * not the ones of the package. A shell opened in German stays German once
 * emptied.
 */
export const createActions = (
	update: (change: (data: ShellData) => ShellData) => void,
	start: ShellData
): ShellActions => ({
	reset: () => update(() => start),

	setLang: lang => update(data => ({ ...data, lang })),
	setAnimation: animation => update(data => ({ ...data, animation })),
	setKeyboardOnFocus: keyboardOnFocus =>
		update(data => ({ ...data, keyboardOnFocus })),

	// sets the module theme (colors() will follow) then notes its name: the
	// second triggers the render, the first provides the colors it will read
	// back. An unknown name does nothing: the command does not let it through.
	setThemeName: name => {
		const next = themeByName(name)
		if (!next) return

		setTheme(next)
		update(data => ({ ...data, themeName: name }))
	},

	/**
	 * The step starts from what is on screen: the size of the theme as long
	 * as nobody has zoomed, the size the visitor set afterwards. Asking for
	 * more at the top changes nothing, and so wakes nothing.
	 */
	zoomFont: direction =>
		update(data => {
			const current = data.fontSize ?? fonts().size
			const next = Math.min(
				FONT_MAX,
				Math.max(FONT_MIN, current + direction * FONT_STEP)
			)

			return next === data.fontSize ? data : { ...data, fontSize: next }
		}),

	resetFont: () =>
		update(data =>
			data.fontSize === null ? data : { ...data, fontSize: null }
		),

	addCommand: command =>
		update(data =>
			command.restricted
				? {
						...data,
						restrictedCommands: [
							...data.restrictedCommands,
							{ ...command, visible: true },
						],
						cursor: null,
					}
				: {
						...data,
						commands: [
							...data.commands,
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
		update(data => {
			const done = (list: Command[]) =>
				list.some(command => command.id === id && command.isRendered)

			if (done(data.commands) || done(data.restrictedCommands)) return data

			return {
				...data,
				commands: rendered(data.commands, id),
				restrictedCommands: rendered(data.restrictedCommands, id),
			}
		}),

	clear: () =>
		update(data => ({
			...data,
			commands: data.commands.map(command => ({ ...command, visible: false })),
			restrictedCommands: data.restrictedCommands.map(command => ({
				...command,
				visible: false,
			})),
		})),

	moveCursor: direction =>
		update(data => {
			if (data.cursor === null)
				return { ...data, cursor: data.commands.length - 1 }
			if (direction < 0)
				return {
					...data,
					cursor: data.cursor < 0 ? -1 : data.cursor + direction,
				}
			if (direction > 0)
				return {
					...data,
					cursor:
						data.cursor >= data.commands.length
							? data.commands.length
							: data.cursor + direction,
				}
			return data
		}),
})

/**
 * One store per shell, and not one for the module: two terminals on the same
 * page keep their own history, their own cursor and their own options.
 *
 * The values and the actions live in the same store — `getState()` hands
 * back the pair a handle is made of — and the actions stay written against
 * an `update`, which is what lets them be read and tested without a store
 * at all.
 *
 * An action that answers the values it was given has changed nothing, and
 * must wake nobody: the equality is checked here rather than in each of
 * them.
 */
export const createShellStore = (options: ShellOptions = {}): ShellStore => {
	const start = initialData(options)

	return createStore<ShellState>((set, get) => ({
		...start,
		...createActions(change => {
			const next = change(get())
			if (next !== get()) set(next)
		}, start),
	}))
}
