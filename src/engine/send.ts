import { getCommands } from "@state/registry"
import { shellActions } from "@state/store"
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

const NO_LISTENER = () => {}

/**
 * The listeners this module can warn, set by the consumer. The one for the
 * end of the writing belongs to the rendering and lives in the shell: here,
 * nothing knows what is on screen.
 */
let onStart: CommandListener = NO_LISTENER
let onDone: CommandListener = NO_LISTENER
let onError: CommandErrorListener = NO_LISTENER

export const setListeners = (listeners: {
	start?: CommandListener
	done?: CommandListener
	error?: CommandErrorListener
}) => {
	onStart = listeners.start || NO_LISTENER
	onDone = listeners.done || NO_LISTENER
	onError = listeners.error || NO_LISTENER
}

/**
 * Plays a command: its side effect first, then its addition to the history.
 * The store is a module, there is no dispatch to carry around, and so the
 * function can be called from anywhere.
 */
const send = (commandPattern: string, restricted: boolean) => {
	const commands = getCommands()

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

	onStart(event)

	let cmd
	try {
		cmd = createCommand({ commands, commandPattern, restricted })
	} catch (error) {
		// the action threw: the command does not even exist enough to be
		// added to the history, there is only the error left to render
		onError({ ...event, reason: "thrown", error })
		return
	}

	const baseCmd = findCommand({ commands, name: cmd.name, restricted })

	if (baseCmd?.effect && cmd.canExecute) {
		try {
			baseCmd.effect({ args: cmd.args })
		} catch (error) {
			// the effect threw after the action had returned its text: the line
			// shows up all the same, the consumer learns the rest failed
			onError({ ...event, reason: "thrown", error })
		}
	}

	shellActions().addCommand(cmd)

	if (cmd.canExecute) {
		// the action returned its text and the effect played: the command is
		// over, even if nothing is on screen yet
		onDone(event)
		return
	}

	/**
	 * A shell with no command at all lets through whatever is typed — that
	 * is a choice of the consumer, not a mistake of the visitor, and so
	 * there is nothing to report. Elsewhere, the line did not play: either
	 * the name is unknown, or it exists and its arguments do not pass.
	 */
	if (Object.keys(commands).length === 0) return

	onError({ ...event, reason: baseCmd ? "args" : "unknown" })
}

/** plays a command of the visitor */
export const run = (commandPattern: string) => send(commandPattern, false)

/** plays an internal command, one the visitor cannot type */
export const runRestricted = (commandPattern: string) =>
	send(commandPattern, true)
