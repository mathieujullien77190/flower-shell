import { readHelp } from "@engine/terminalEngine"
import { createInstance, withInstance } from "@state/instance"
import { fontCommand } from "./font"

const say = (args: string[]) =>
	fontCommand.action({ name: "font", args, commands: {} })

const play = (args: string[]) => {
	const instance = createInstance()
	args.forEach(arg =>
		withInstance(instance, () => fontCommand.effect!({ args: [arg] }))
	)

	return instance.store.getState().fontSize
}

describe("font", () => {
	it("takes the two directions and the way back", () => {
		expect(fontCommand.testArgs).toEqual({
			authorize: ["+", "-", "reset"],
			empty: false,
		})
	})

	it("announces the move and not the size it lands on", () => {
		expect(say(["+"])).toBe("bigger")
		expect(say(["-"])).toBe("smaller")
		expect(say(["reset"])).toBe("back to the size of the theme")
	})

	it("grows the text a step at a time", () => {
		expect(play(["+"])).toBe(18)
		expect(play(["+", "+"])).toBe(20)
	})

	it("shrinks it the same way", () => {
		expect(play(["-"])).toBe(14)
	})

	it("puts it back on the size of the theme", () => {
		expect(play(["+", "reset"])).toBeNull()
	})

	it("escapes the plus of its help: a bare one would color the rest", () => {
		expect(readHelp(fontCommand)!.patterns[0].pattern).toBe("font \\+")
	})
})
