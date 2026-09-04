import { unknowCommand } from "./unknow"

describe("unknow", () => {
	it("is restricted: it is looked up by name, never typed", () => {
		expect(unknowCommand.restricted).toBe(true)
	})

	it("names the command that was not recognised", () => {
		expect(
			unknowCommand.action({ name: "unknow", args: ["nope"], commands: {} })
		).toBe(
			"nope is not recognised as an internal command, type `help` to list the commands"
		)
	})
})
