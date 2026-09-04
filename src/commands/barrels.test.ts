import * as common from "./common"
import * as restricted from "./restricted"
import { baseCommands } from "./base"

/**
 * The two folders hand out what `base` gathers, plus the two pieces that are
 * not commands: the field of flowers and the logo. Read here so that a name
 * dropped from a barrel shows up as a failing test rather than as a broken
 * import in a consumer's build.
 */
describe("the barrels of the commands", () => {
	it("hands the commands the visitor may type", () => {
		expect(Object.keys(common).sort()).toEqual([
			"animationCommand",
			"clearCommand",
			"flowersCommand",
			"fontCommand",
			"helloCommand",
			"helpCommand",
			"langCommand",
			"plantFlowers",
			"testCommand",
			"themeCommand",
		])

		expect(common.plantFlowers().split("\n")).toHaveLength(9)
		expect(common.testCommand.restricted).toBe(false)
	})

	it("hands the commands the shell plays for itself", () => {
		expect(Object.keys(restricted).sort()).toEqual([
			"actionmapCommand",
			"argumenterrorCommand",
			"title",
			"titleCommand",
			"unknowCommand",
			"welcomeCommand",
		])

		expect(restricted.title).toContain("'---'")
	})

	it("gathers them under the names that invoke them", () => {
		expect(baseCommands.help).toBe(common.helpCommand)
		expect(baseCommands.title).toBe(restricted.titleCommand)
		// the workbench is of `common` and stays out: it is mounted by hand
		expect(baseCommands.test).toBeUndefined()
	})
})
