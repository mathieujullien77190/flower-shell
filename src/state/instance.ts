import { BaseCommands } from "@types"
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
 * The theme and the dictionaries stay in their modules, shared by every
 * shell: `highlight()` is a function and the styled-components read
 * `colors()` outside of any render, so a provider could not reach them
 * either. Two terminals therefore wear the same theme, and switching it in
 * one repaints the other.
 */
export type ShellInstance = {
	/** the values and the actions of this shell: `store.getState()` is both */
	store: ShellStore
	/** the commands this shell knows, its `commands` prop as it stands */
	commands: () => BaseCommands
	setCommands: (commands: BaseCommands) => void
	listeners: () => ShellListeners
	setListeners: (listeners: ShellListeners) => void
}

export const createInstance = (options?: ShellOptions): ShellInstance => {
	let commands: BaseCommands = {}
	let listeners: ShellListeners = {}

	return {
		store: createShellStore(options),
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
