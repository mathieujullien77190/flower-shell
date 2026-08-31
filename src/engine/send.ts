import type { ShellInstance } from "@state/instance"
import { playingInstance, withInstance } from "@state/instance"
import { createCommand, findCommand } from "./terminalEngine"

/** what a listener receives: the line that was sent, whole and split */
export type CommandEvent = {
	/** the name: the first word of the line */
	name: string
	/** the arguments: the rest of the line, word by word */
	args: string[]
	/** the whole line, as it was sent */
	pattern: string
}

/** why the command did not play */
export type CommandErrorReason =
	/** no command by that name in the registry */
	| "unknown"
	/** the command exists, its arguments do not pass */
	| "args"
	/** its action or its effect threw */
	| "thrown"

export type CommandErrorEvent = CommandEvent & {
	reason: CommandErrorReason
	/** what was thrown, for the `thrown` reason alone */
	error?: unknown
}

export type CommandListener = (event: CommandEvent) => void
export type CommandErrorListener = (event: CommandErrorEvent) => void

/**
 * Plays a command on one shell: its side effect first, then its addition to
 * the history.
 *
 * The instance travels with the line rather than being looked up, so two
 * terminals on the same page never play into each other. It is posted as the
 * playing one for the whole call, which is what lets an `action` reach `t()`
 * and an `effect` reach `shellActions()` without taking either as an
 * argument.
 */
const send = (
	instance: ShellInstance,
	commandPattern: string,
	restricted: boolean
) =>
	withInstance(instance, () => {
		const commands = instance.commands()
		const listeners = instance.listeners()
		const store = instance.store

		/**
		 * The start is reported before `createCommand`, which already plays the
		 * action: after it, it would be too late to be a "before". So the name
		 * and the arguments come from the line itself, and not from the command
		 * — at that point the shell does not yet know whether it has one.
		 */
		const split = commandPattern.split(" ")
		const event: CommandEvent = {
			name: split[0],
			args: split.slice(1),
			pattern: commandPattern,
		}

		listeners.start?.(event)

		let cmd
		try {
			cmd = createCommand({ commands, commandPattern, restricted })
		} catch (error) {
			// the action threw: the command does not even exist enough to be
			// added to the history, there is only the error left to render
			listeners.error?.({ ...event, reason: "thrown", error })
			return
		}

		const baseCmd = findCommand({ commands, name: cmd.name, restricted })

		if (baseCmd?.effect && cmd.canExecute) {
			try {
				baseCmd.effect({ args: cmd.args })
			} catch (error) {
				// the effect threw after the action had returned its text: the line
				// shows up all the same, the consumer learns the rest failed
				listeners.error?.({ ...event, reason: "thrown", error })
			}
		}

		store.getState().addCommand(cmd)

		if (cmd.canExecute) {
			// the action returned its text and the effect played: the command is
			// over, even if nothing is on screen yet
			listeners.done?.(event)
			return
		}

		/**
		 * A shell with no command at all lets through whatever is typed — that
		 * is a choice of the consumer, not a mistake of the visitor, and so
		 * there is nothing to report. Elsewhere, the line did not play: either
		 * the name is unknown, or it exists and its arguments do not pass.
		 */
		if (Object.keys(commands).length === 0) return

		listeners.error?.({ ...event, reason: baseCmd ? "args" : "unknown" })
	})

/**
 * Plays a line on the shell a command is playing for. It is what a command's
 * `effect` uses to reach its own terminal — `actionmap` does, to play the
 * line a clickable marker points at — and it only means something inside a
 * command: outside one, no shell is in play, and there is a handle to take
 * instead.
 */
export const runHere = (commandPattern: string) => {
	const instance = playingInstance()

	if (!instance) {
		throw new Error(
			"runHere() is only reachable while a command plays. Outside of one, use the handle of the shell you mean."
		)
	}

	send(instance, commandPattern, false)
}

/**
 * The two ways in, bound to one shell. This is what a handle hands out, and
 * the only way a line reaches a terminal from outside React.
 */
export const createRunners = (instance: ShellInstance) => ({
	/** plays a command of the visitor */
	run: (commandPattern: string) => send(instance, commandPattern, false),
	/** plays an internal command, one the visitor cannot type */
	runRestricted: (commandPattern: string) =>
		send(instance, commandPattern, true),
})
