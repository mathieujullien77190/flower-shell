import type { BaseCommand, BaseCommands } from "@types"
import { readHelp } from "@engine/terminalEngine"
import { helpCommand } from "./help"

const cmd = (over: Partial<BaseCommand> = {}): BaseCommand => ({
	restricted: false,
	action: () => "",
	...over,
})

const ask = (args: string[], commands: BaseCommands) =>
	helpCommand.action({
		name: "help",
		args,
		commands,
		help: readHelp(helpCommand),
	})

const mounted: BaseCommands = {
	help: helpCommand,
	zebra: cmd({ help: { patterns: [{ pattern: "zebra", description: "z" }] } }),
	apple: cmd({ help: { patterns: [{ pattern: "apple", description: "a" }] } }),
	welcome: cmd({ restricted: true, help: { patterns: [] } }),
	silent: cmd(),
}

describe("help with no argument", () => {
	it("names every command it lists, wrapped in the info marker", () => {
		expect(ask([], mounted)).toContain("+apple+")
		expect(ask([], mounted)).toContain("+zebra+")
	})

	it("sorts the commands by name", () => {
		const text = ask([], mounted)

		expect(text.indexOf("+apple+")).toBeLessThan(text.indexOf("+zebra+"))
	})

	it("leaves out the restricted commands, and help itself", () => {
		expect(ask([], mounted)).not.toContain("+welcome+")
		expect(ask([], mounted)).not.toContain("+help+")
	})

	it("leaves out a command that carries no help", () => {
		expect(ask([], mounted)).not.toContain("+silent+")
	})

	it("names a command whose help carries no patterns all the same", () => {
		// `patterns` is required by the type, and a consumer writing plain
		// JavaScript can still leave it out
		const bare = cmd({ help: {} as BaseCommand["help"] })

		expect(ask([], { ...mounted, bare })).toContain("+bare+")
	})
})

describe("help about one command", () => {
	it("prints its patterns", () => {
		expect(ask(["zebra"], mounted)).toContain("zebra : z")
	})

	it("prints the description of a command that has one", () => {
		expect(ask(["help"], mounted)).toContain("Provides help about the commands")
	})

	it("answers that a name it does not know does not exist", () => {
		expect(ask(["nope"], mounted)).toBe("This command does not exist")
	})
})
