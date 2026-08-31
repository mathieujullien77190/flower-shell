import { BaseCommand, BaseCommands, Command, Args, Help } from "@types"
import { t } from "@i18n/lang"

const isAuthorizeArgs = (args: string[], testArgs: Args) => {
	const authorize =
		typeof testArgs.authorize === "function"
			? testArgs.authorize()
			: testArgs.authorize

	const test1 =
		args.filter(item => authorize.includes(item)).length === args.length

	const test2 =
		(args.length === 0 && testArgs.empty === true) || args.length > 0

	return test1 && test2
}

type CreateCommandProps = {
	commands: BaseCommands
	commandPattern: string
	restricted: boolean
}

/**
 * The rank of arrival, strictly increasing. It orders the display in place
 * of `timestamp`: two commands played one after the other in the same loop
 * — the opening — land on the same millisecond, and the sort, being stable,
 * then returned the order of the two lists rather than the one of the
 * typing.
 */
let count = 0

export const createCommand = ({
	commands,
	commandPattern,
	restricted = false,
}: CreateCommandProps): Command => {
	const timestamp = new Date().getTime()
	const order = count++
	const split = commandPattern.split(" ")
	const name = split[0]
	const args = split.slice(1)

	const select = findCommand({ commands, name, restricted })

	if (select) {
		const okArgs = !select.testArgs || isAuthorizeArgs(args, select.testArgs)

		if (okArgs) {
			return {
				restricted,
				name,
				args,
				result: executeCommand({ commands, name, command: select, args }),
				pattern: commandPattern,
				timestamp,
				order,
				id: `${timestamp}-${name}-${order}`,
				isRendered: false,
				canExecute: true,
			}
		} else {
			const error = findCommand({
				commands,
				name: "argumenterror",
				restricted: true,
			})
			return {
				restricted,
				pattern: commandPattern,
				name,
				args,
				// without the error command, the dictionary of the package answers
				result: error
					? executeCommand({
							commands,
							name: "argumenterror",
							command: error,
							args: [name],
						})
					: t("error.args"),
				timestamp,
				order,
				id: `${timestamp}-${name}-${order}`,
				isRendered: false,
				canExecute: false,
			}
		}
	} else {
		const error = findCommand({ commands, name: "unknow", restricted: true })

		/**
		 * A shell with no command at all has nothing to object to: the empty
		 * registry is a choice of the consumer, not a mistake of the visitor.
		 * The line goes through, and the next one opens. As soon as one
		 * command exists, an unknown command is an error again.
		 */
		const bare = Object.keys(commands).length === 0

		return {
			restricted,
			pattern: commandPattern,
			name,
			args,
			result: bare
				? ""
				: error
					? executeCommand({
							commands,
							name: "unknow",
							command: error,
							args: [name],
						})
					: t("error.unknown", { name }),
			timestamp,
			order,
			id: `${timestamp}-${name}-${order}`,
			isRendered: false,
			canExecute: false,
		}
	}
}

type ExecuteCommandProps = {
	commands: BaseCommands
	name: string
	command: BaseCommand
	args: Command["args"]
}

export const executeCommand = ({
	commands,
	name,
	command,
	args,
}: ExecuteCommandProps): string => {
	return command.action({
		commands,
		name,
		args,
		help: readHelp(command),
	})
}

/**
 * The help of a command. It can be a function, read here and not before:
 * `lang` uses that to list the mounted languages, which do not exist at the
 * moment the command is written.
 */
export const readHelp = (command: BaseCommand): Help | undefined =>
	typeof command.help === "function" ? command.help() : command.help

type FindCommandProps = {
	commands: BaseCommands
	name: string
	restricted: boolean
}

export const findCommand = ({
	commands,
	name,
	restricted = false,
}: FindCommandProps): BaseCommand | null => {
	const command = commands[name]
	if (!command) return null

	return command.restricted === restricted || restricted === null
		? command
		: null
}

type AutocompleteCommandProps = {
	commands: BaseCommands
	startCommand: string
}

export const autocompleteCommand = ({
	commands,
	startCommand,
}: AutocompleteCommandProps): string => {
	if (startCommand === "") return ""

	const find = Object.keys(commands).filter(
		name => !commands[name]?.restricted && name.indexOf(startCommand) === 0
	)
	if ((find[0] || "").length === startCommand.length) return ""
	return find[0] || ""
}
