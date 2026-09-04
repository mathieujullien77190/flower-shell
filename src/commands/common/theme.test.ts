import { readHelp } from "@engine/terminalEngine"
import { createInstance, withInstance } from "@state/instance"
import { themes } from "@theme"
import type { ShellThemeInput } from "@theme"
import { themeCommand } from "./theme"

/** a shell carrying a catalogue of its own, the way `<Shell themes>` does */
const wearing = (catalogue: Record<string, ShellThemeInput> = themes) => {
	const instance = createInstance()
	instance.setThemes(catalogue)

	return instance
}

describe("theme", () => {
	it("takes the names of the catalogue of its shell, and nothing else", () => {
		const { authorize } = themeCommand.testArgs!

		withInstance(wearing(), () =>
			expect(typeof authorize === "function" && authorize()).toEqual(
				Object.keys(themes)
			)
		)
	})

	it("keeps two shells out of each other", () => {
		const { authorize } = themeCommand.testArgs!
		const one = wearing({ kiwi: themes.kiwi })
		const two = wearing({ maple: themes.maple, rice: themes.rice })

		withInstance(one, () =>
			expect(typeof authorize === "function" && authorize()).toEqual(["kiwi"])
		)
		withInstance(two, () =>
			expect(typeof authorize === "function" && authorize()).toEqual([
				"maple",
				"rice",
			])
		)
	})

	it("announces the theme it is asked for", () => {
		expect(
			themeCommand.action({ name: "theme", args: ["kiwi"], commands: {} })
		).toBe("theme: kiwi")
	})

	it("wears it", () => {
		const instance = wearing()

		withInstance(instance, () => themeCommand.effect!({ args: ["kiwi"] }))

		expect(instance.store.getState().themeName).toBe("kiwi")
		expect(instance.theme()).toEqual(themes.kiwi)
	})

	it("leaves the line as it is when the tone cannot be read", () => {
		// a background no tone can be read off: the description stands alone
		const instance = wearing({
			ghost: { colors: { background: "transparent" } },
		})

		withInstance(instance, () =>
			expect(readHelp(themeCommand)!.patterns).toEqual([
				{ pattern: "theme ghost", description: "theme.ghost" },
			])
		)
	})

	it("lists the catalogue as it stands, each theme behind its tone", () => {
		const instance = wearing({ kiwi: themes.kiwi })

		withInstance(instance, () =>
			expect(readHelp(themeCommand)!.patterns).toEqual([
				{
					pattern: "theme kiwi",
					description:
						"dark : Husk dark ground, flesh green and the ring of the seeds",
				},
			])
		)
	})
})
