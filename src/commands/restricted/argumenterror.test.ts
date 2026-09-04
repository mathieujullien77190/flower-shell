import { argumenterrorCommand } from "./argumenterror"

describe("argumenterror", () => {
	it("is restricted: it is looked up by name, never typed", () => {
		expect(argumenterrorCommand.restricted).toBe(true)
	})

	it("says the arguments did not pass", () => {
		expect(
			argumenterrorCommand.action({
				name: "argumenterror",
				args: ["nope"],
				commands: {},
			})
		).toBe("unrecognised argument(s)")
	})
})
