import { BaseCommands, Dictionaries } from "@types"
import { prepareDict } from "@i18n/dict"
import { prepareThemes, worn } from "../theme/catalogue"
import type { ShellTheme, ShellThemeInput } from "../theme/types"
import type { CommandErrorListener, CommandListener } from "@engine/send"
import { createShellStore, type ShellOptions, type ShellStore } from "./store"

export type ShellListeners = {
	start?: CommandListener
	done?: CommandListener
	/** the writing is over: reported by the terminal, not by the engine */
	rendered?: CommandListener
	error?: CommandErrorListener
}

/**
 * Everything one terminal owns: its values, its actions, the commands it
 * knows and the listeners the consumer gave it. Two shells on the same page
 * own two of these and never meet.
 *
 * The values live in a store of its own, and not in a provider, because a
 * command is not a component: an `effect` reaching `shellActions()` and
 * `t()` reading the language both happen outside of any render. The store
 * answers them there, and the hooks of `hooks.ts` subscribe to the slice
 * they need — a component reading the language does not paint again because
 * a line was added.
 *
 * The commands and the listeners are reached through functions rather than
 * fields: the component that renders the shell takes the instance as a prop,
 * and a prop object is not something a render may write into.
 *
 * The dictionaries belong to the instance for the same reason as the store:
 * `t()` is called from an `action`, outside of any render, and reads them
 * off the shell in play. Two terminals side by side therefore speak two
 * languages out of two dictionaries, and neither writes into the other.
 *
 * The themes belong to it for the same reason: the catalogue the visitor can
 * take, and the one worn out of it. Two terminals side by side therefore
 * wear two themes, and switching one repaints only itself.
 */
export type ShellInstance = {
	/** the values and the actions of this shell: `store.getState()` is both */
	store: ShellStore
	/**
	 * The dictionaries of this shell, ready to be read: its `dict` prop laid
	 * on the English of the package. Without one, English alone.
	 */
	dict: () => Dictionaries
	setDict: (custom?: Dictionaries) => void
	/** the themes this shell can take, its `themes` prop laid on the default */
	themes: () => Record<string, ShellTheme>
	setThemes: (custom?: Record<string, ShellThemeInput>) => void
	/** the one it wears out of them, read off the name in its store */
	theme: () => ShellTheme
	/** the name it opens on: ignored when the catalogue does not carry it */
	wearTheme: (name?: string) => void
	/** the commands this shell knows, its `commands` prop as it stands */
	commands: () => BaseCommands
	setCommands: (commands: BaseCommands) => void
	listeners: () => ShellListeners
	setListeners: (listeners: ShellListeners) => void
}

export const createInstance = (options?: ShellOptions): ShellInstance => {
	let commands: BaseCommands = {}
	let listeners: ShellListeners = {}
	let dict = prepareDict()
	let themes = prepareThemes()
	/**
	 * What it wears: the name held by its store, read against its catalogue.
	 * The two are never out of step — the store turns down a name the
	 * catalogue does not carry.
	 */
	const theme = () => worn(themes, store.getState().themeName)

	const store = createShellStore(
		{ byName: name => themes[name], worn: theme },
		options
	)

	return {
		store,
		dict: () => dict,
		setDict: custom => {
			dict = prepareDict(custom)
		},
		themes: () => themes,
		setThemes: custom => {
			themes = prepareThemes(custom)
		},
		theme,
		/**
		 * The name it opens on: the theme of its catalogue carrying it, else
		 * the first of the catalogue. A name the catalogue does not carry is
		 * ignored rather than quietly mounted — it cannot open on a theme the
		 * visitor would have no way of finding again.
		 */
		wearTheme: name => {
			const first = Object.keys(themes)[0]

			store.getState().setThemeName(name && themes[name] ? name : first || "")
		},
		commands: () => commands,
		setCommands: next => {
			commands = next
		},
		listeners: () => listeners,
		setListeners: next => {
			listeners = next
		},
	}
}

/**
 * The shell a command is currently playing for.
 *
 * A command's `action` and `effect` are plain functions, not components:
 * they cannot read a context, yet `t()` needs a language and an effect needs
 * the store. So the instance is posted here for the time `send` runs, and
 * taken back down after — a scope, not a singleton.
 *
 * It holds because everything between the two is synchronous: the action
 * returns its text, the effect plays, the line is added, and only then does
 * `send` return. An `effect` that awaits something and touches the state
 * afterwards is outside that window and must use the handle of its shell.
 */
let playing: ShellInstance | null = null

export const withInstance = <T>(instance: ShellInstance, play: () => T): T => {
	const previous = playing
	playing = instance
	try {
		return play()
	} finally {
		playing = previous
	}
}

/** the instance playing right now, or null outside of a command */
export const playingInstance = (): ShellInstance | null => playing

/**
 * The state of the shell a command is playing for, so an `effect` can attack
 * it the way it always has. Outside a command there is no shell to name:
 * take the handle of the one you mean.
 */
export const shellActions = () => {
	if (!playing) {
		throw new Error(
			"shellActions() is only reachable while a command plays. Outside of one, use the handle of the shell you mean."
		)
	}

	return playing.store.getState()
}
