import { welcomeCommand } from "./welcome"

describe("welcome", () => {
	it("is restricted: the banner plays it, the visitor cannot", () => {
		expect(welcomeCommand.restricted).toBe(true)
	})

	it("greets with a text of the dictionary, markup included", () => {
		expect(
			welcomeCommand.action({ name: "welcome", args: [], commands: {} })
		).toBe("Welcome to $flower-shell$ — type `help` to list the commands")
	})

	it("hides the line that played it", () => {
		expect(welcomeCommand.display!.hideCmd).toBe(true)
	})
})
