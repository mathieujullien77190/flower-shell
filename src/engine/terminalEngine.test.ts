import type { BaseCommand, BaseCommands } from "@types"
import {
	autocompleteCommand,
	createCommand,
	executeCommand,
	findCommand,
	readHelp,
} from "./terminalEngine"

const cmd = (over: Partial<BaseCommand> = {}): BaseCommand => ({
	restricted: false,
	action: () => "ok",
	...over,
})

const commands: BaseCommands = {
	hello: cmd({ action: ({ args }) => `hello ${args.join(" ")}`.trim() }),
	theme: cmd({
		action: () => "theme changed",
		testArgs: { authorize: ["flower", "lavender"], empty: false },
	}),
	lang: cmd({
		action: () => "lang changed",
		// a list read late: the catalogue only exists once mounted
		testArgs: { authorize: () => ["en", "fr"], empty: true },
	}),
	welcome: cmd({ restricted: true, action: () => "welcome" }),
	unknow: cmd({ restricted: true, action: ({ args }) => `no ${args[0]}` }),
	argumenterror: cmd({
		restricted: true,
		action: ({ args }) => `bad ${args[0]}`,
	}),
}

describe("findCommand", () => {
	it("finds a command of the visitor", () => {
		expect(findCommand({ commands, name: "hello", restricted: false })).toBe(
			commands.hello
		)
	})

	it("hides a restricted command from the visitor", () => {
		expect(
			findCommand({ commands, name: "welcome", restricted: false })
		).toBeNull()
	})

	it("finds a restricted command when asked as one", () => {
		expect(findCommand({ commands, name: "welcome", restricted: true })).toBe(
			commands.welcome
		)
	})

	it("finds nothing under an unknown name", () => {
		expect(
			findCommand({ commands, name: "nope", restricted: false })
		).toBeNull()
	})
})

describe("executeCommand", () => {
	it("plays the action with the name, the arguments and the help", () => {
		const action = jest.fn(() => "played")
		const command = cmd({ action, help: { patterns: [] } })

		const result = executeCommand({
			commands,
			name: "hello",
			command,
			args: ["world"],
		})

		expect(result).toBe("played")
		expect(action).toHaveBeenCalledWith({
			commands,
			name: "hello",
			args: ["world"],
			help: { patterns: [] },
		})
	})
})

describe("readHelp", () => {
	it("reads a help given as an object", () => {
		const help = { patterns: [] }
		expect(readHelp(cmd({ help }))).toBe(help)
	})

	it("calls a help given as a function", () => {
		const help = { patterns: [] }
		expect(readHelp(cmd({ help: () => help }))).toBe(help)
	})

	it("answers nothing for a command with no help", () => {
		expect(readHelp(cmd())).toBeUndefined()
	})
})

describe("createCommand", () => {
	it("splits the line into a name and its arguments", () => {
		const command = createCommand({
			commands,
			commandPattern: "hello you two",
			restricted: false,
		})

		expect(command.name).toBe("hello")
		expect(command.args).toEqual(["you", "two"])
		expect(command.pattern).toBe("hello you two")
		expect(command.result).toBe("hello you two")
		expect(command.canExecute).toBe(true)
		expect(command.isRendered).toBe(false)
	})

	it("orders two commands played in the same millisecond", () => {
		const first = createCommand({
			commands,
			commandPattern: "hello",
			restricted: false,
		})
		const second = createCommand({
			commands,
			commandPattern: "hello",
			restricted: false,
		})

		expect(second.order!).toBeGreaterThan(first.order!)
		expect(second.id).not.toBe(first.id)
	})

	it("turns down an argument the command does not accept", () => {
		const command = createCommand({
			commands,
			commandPattern: "theme neon",
			restricted: false,
		})

		expect(command.canExecute).toBe(false)
		expect(command.result).toBe("bad theme")
	})

	it("takes an argument read off a function", () => {
		const command = createCommand({
			commands,
			commandPattern: "lang fr",
			restricted: false,
		})

		expect(command.canExecute).toBe(true)
		expect(command.result).toBe("lang changed")
	})

	it("turns down an empty line on a command that requires an argument", () => {
		const command = createCommand({
			commands,
			commandPattern: "theme",
			restricted: false,
		})

		expect(command.canExecute).toBe(false)
	})

	it("lets an empty line through on a command that allows it", () => {
		const command = createCommand({
			commands,
			commandPattern: "lang",
			restricted: false,
		})

		expect(command.canExecute).toBe(true)
	})

	it("answers the dictionary when no argumenterror command is mounted", () => {
		const bare: BaseCommands = { theme: commands.theme }

		const command = createCommand({
			commands: bare,
			commandPattern: "theme neon",
			restricted: false,
		})

		expect(command.result).toBe("unrecognised argument(s)")
	})

	it("reports an unknown name through the unknow command", () => {
		const command = createCommand({
			commands,
			commandPattern: "nope",
			restricted: false,
		})

		expect(command.canExecute).toBe(false)
		expect(command.result).toBe("no nope")
	})

	it("answers the dictionary when no unknow command is mounted", () => {
		const command = createCommand({
			commands: { hello: commands.hello },
			commandPattern: "nope",
			restricted: false,
		})

		expect(command.result).toContain("nope is not recognised")
	})

	it("objects to nothing when the registry is empty", () => {
		const command = createCommand({
			commands: {},
			commandPattern: "whatever",
			restricted: false,
		})

		expect(command.result).toBe("")
		expect(command.canExecute).toBe(false)
	})

	it("plays a restricted command when asked as one", () => {
		const command = createCommand({
			commands,
			commandPattern: "welcome",
			restricted: true,
		})

		expect(command.restricted).toBe(true)
		expect(command.result).toBe("welcome")
	})
})

describe("autocompleteCommand", () => {
	it("offers nothing on an empty line", () => {
		expect(autocompleteCommand({ commands, startCommand: "" })).toBe("")
	})

	it("completes the name of a command", () => {
		expect(autocompleteCommand({ commands, startCommand: "hel" })).toBe("hello")
	})

	it("offers nothing on a name already whole", () => {
		expect(autocompleteCommand({ commands, startCommand: "hello" })).toBe("")
	})

	it("never offers a restricted command", () => {
		expect(autocompleteCommand({ commands, startCommand: "wel" })).toBe("")
	})

	it("completes the first argument on what the command accepts", () => {
		expect(autocompleteCommand({ commands, startCommand: "theme flo" })).toBe(
			"theme flower"
		)
	})

	it("completes an argument read off a function", () => {
		expect(autocompleteCommand({ commands, startCommand: "lang f" })).toBe(
			"lang fr"
		)
	})

	it("offers nothing on a command that takes free text", () => {
		expect(autocompleteCommand({ commands, startCommand: "hello wor" })).toBe(
			""
		)
	})

	it("offers nothing past the first argument", () => {
		expect(
			autocompleteCommand({ commands, startCommand: "theme flower x" })
		).toBe("")
	})

	it("offers nothing on the space that opens an argument", () => {
		expect(autocompleteCommand({ commands, startCommand: "theme " })).toBe("")
	})
})
