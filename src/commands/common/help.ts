import { BaseCommand, BaseCommands, Help } from "@types"
import { t } from "@i18n/lang"
import { readHelp } from "@engine/terminalEngine"

const buildHelp = (help: Help) => {
	const patterns = help.patterns
		.map(item => `\t${item.pattern} : ${t(item.description)}\n`)
		.join("")

	return `${help.description ? t(help.description) : ""}${
		help.patterns.length > 0 ? "\n" : ""
	}${patterns}`
}

const buildAllHelp = (commands: BaseCommands) =>
	Object.entries(commands)
		.flatMap(([name, command]) =>
			command && !command.restricted && command.help && name !== "help"
				? [{ name, help: readHelp(command) }]
				: []
		)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map(
			({ name, help }) =>
				`+${name}+\n${(help?.patterns ?? [])
					.map(pattern => `\t${pattern.pattern} : ${t(pattern.description)}\n`)
					.join("")}\n`
		)
		.join("")

const commandHelp = (commands: BaseCommands, name: string): Help | null => {
	const command = commands[name]
	return command ? readHelp(command) || null : null
}

/**
 * The catalogue of the shell, read off the commands actually mounted: it is
 * handed them at execution, so a command of the consumer's lists itself
 * without saying anything.
 */
export const helpCommand: BaseCommand = {
	restricted: false,
	action: ({ args, commands }) => {
		if (args.length === 0) return `\n${buildAllHelp(commands)}`

		const select = commandHelp(commands, args[0])
		if (select) return buildHelp(select)

		return t("help.notFound")
	},
	help: {
		description: "help.desc",
		patterns: [{ pattern: "help [command]", description: "help.usage" }],
	},
}
