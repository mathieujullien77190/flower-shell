import { readHelp } from "@engine/terminalEngine"
import { createInstance, withInstance } from "@state/instance"
import { setThemes, themes } from "@theme"
import { themeCommand } from "./theme"

beforeEach(() => setThemes(themes))

describe("theme", () => {
	it("takes the names of the mounted catalogue, and nothing else", () => {
		const { authorize } = themeCommand.testArgs!

		expect(typeof authorize === "function" && authorize()).toEqual(
			Object.keys(themes)
		)
	})

	it("announces the theme it is asked for", () => {
		expect(
			themeCommand.action({ name: "theme", args: ["kiwi"], commands: {} })
		).toBe("theme: kiwi")
	})

	it("wears it", () => {
		const instance = createInstance()

		withInstance(instance, () => themeCommand.effect!({ args: ["kiwi"] }))

		expect(instance.data().themeName).toBe("kiwi")
	})

	it("lists the catalogue as it stands, each theme behind its tone", () => {
		setThemes({ kiwi: themes.kiwi })

		expect(readHelp(themeCommand)!.patterns).toEqual([
			{
				pattern: "theme kiwi",
				description:
					"dark : Husk dark ground, flesh green and the ring of the seeds",
			},
		])
	})
})
