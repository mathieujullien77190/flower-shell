import { BaseCommands } from "@types"
import type { CommandErrorListener, CommandListener } from "@engine/send"
import {
	createActions,
	initialData,
	type ShellActions,
	type ShellData,
	type ShellOptions,
} from "./store"

export type ShellListeners = {
	start?: CommandListener
	done?: CommandListener
	error?: CommandErrorListener
}

/**
 * Everything one terminal owns: its values, its actions, the commands it
 * knows and the listeners the consumer gave it. Two shells on the same page
 * own two of these and never meet.
 *
 * The values are held here rather than in the provider, because a command is
 * not a component: an `effect` reaching `shellActions()` and `t()` reading
 * the language both happen outside of any render, and a context alone cannot
 * answer them. So the instance keeps them, hands the provider a copy to
 * render, and the context only passes the instance around.
 *
 * Everything is read through functions rather than fields: the component
 * that renders the shell takes the instance as a prop, and a prop object is
 * not something a render may write into.
 *
 * The theme and the dictionaries stay in their modules, shared by every
 * shell: `highlight()` is a function and the styled-components read
 * `colors()` outside of any render, so a provider could not reach them
 * either. Two terminals therefore wear the same theme, and switching it in
 * one repaints the other.
 */
export type ShellInstance = {
	/** the values as they stand, read fresh */
	data: () => ShellData
	actions: ShellActions
	/** what the provider hooks up so a change reaches the screen */
	onChange: (watch: (data: ShellData) => void) => void
	/** the commands this shell knows, its `commands` prop as it stands */
	commands: () => BaseCommands
	setCommands: (commands: BaseCommands) => void
	listeners: () => ShellListeners
	setListeners: (listeners: ShellListeners) => void
}

export const createInstance = (options?: ShellOptions): ShellInstance => {
	const start = initialData(options)

	let data = start
	let commands: BaseCommands = {}
	let listeners: ShellListeners = {}
	let watch: (data: ShellData) => void = () => {}

	/**
	 * The new values are posted here first, then handed on to be rendered:
	 * a command that plays two lines in a row reads the first back before
	 * writing the second, and does not wait for a render to see it.
	 */
	const update = (change: (data: ShellData) => ShellData) => {
		const next = change(data)
		if (next === data) return

		data = next
		watch(next)
	}

	return {
		data: () => data,
		actions: createActions(update, start),
		onChange: next => {
			watch = next
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
 * the actions. So the instance is posted here for the time `send` runs, and
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

	return { ...playing.data(), ...playing.actions }
}
