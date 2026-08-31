import { BaseCommands } from "@types"
import type { CommandErrorListener, CommandListener } from "@engine/send"
import { createShellStore, type ShellOptions, type ShellStore } from "./store"

export type ShellListeners = {
	start?: CommandListener
	done?: CommandListener
	error?: CommandErrorListener
}

/**
 * Everything one terminal owns: its state, the commands it knows, and the
 * listeners the consumer gave it. Two shells on the same page own two of
 * these and never meet.
 *
 * The commands and the listeners are reached through functions rather than
 * fields: the component that renders the shell hands them down as props, and
 * a prop object is not something a render may write into.
 *
 * The theme and the dictionaries stay in their modules, shared by every
 * shell: `highlight()` is a function and the styled-components read
 * `colors()` outside of any render, so a provider could not reach them. Two
 * terminals therefore wear the same theme, and switching it in one repaints
 * the other.
 */
export type ShellInstance = {
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
 * a store. So the instance is posted here for the time `send` runs, and
 * taken back down after — a scope, not a singleton.
 *
 * It holds because everything between the two is synchronous: the action
 * returns its text, the effect plays, the line is added, and only then does
 * `send` return. An `effect` that awaits something and touches the store
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
