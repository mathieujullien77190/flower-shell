import { createInstance, withInstance } from "@state/instance"
import { animationCommand } from "./animation"

const say = (args: string[]) =>
	animationCommand.action({ name: "animation", args, commands: {} })

const play = (args: string[], animation: boolean) => {
	const instance = createInstance({ animation })
	withInstance(instance, () => animationCommand.effect!({ args }))

	return instance.data().animation
}

describe("animation", () => {
	it("takes on and off, and nothing else", () => {
		expect(animationCommand.testArgs).toEqual({
			authorize: ["on", "off"],
			empty: false,
		})
	})

	it("announces the state it is asked for", () => {
		expect(say(["on"])).toBe("enabled")
		expect(say(["off"])).toBe("disabled")
	})

	it("turns the writing letter by letter on and off", () => {
		expect(play(["on"], false)).toBe(true)
		expect(play(["off"], true)).toBe(false)
	})
})
