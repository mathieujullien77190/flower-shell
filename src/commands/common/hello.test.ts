import { helloCommand } from "./hello"

const say = (args: string[]) =>
	helloCommand.action({ name: "hello", args, commands: {} })

describe("hello", () => {
	it("greets the world when it is given nothing", () => {
		expect(say([])).toBe("Hello world")
	})

	it("greets what it is given", () => {
		expect(say(["you"])).toBe("Hello you")
	})

	it("keeps the words of a greeting in several", () => {
		expect(say(["you", "two"])).toBe("Hello you two")
	})
})
