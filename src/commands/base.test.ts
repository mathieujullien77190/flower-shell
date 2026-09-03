import { readHelp } from "@engine/terminalEngine"
import { baseCommands } from "./base"

/** the whole help, the way `help` with no argument prints it */
const allHelp = () =>
	baseCommands.help!.action({
		commands: baseCommands,
		name: "help",
		args: [],
		help: readHelp(baseCommands.help!),
	})

/** the same, for one command alone */
const helpOf = (name: string) =>
	baseCommands.help!.action({
		commands: baseCommands,
		name: "help",
		args: [name],
		help: readHelp(baseCommands.help!),
	})

/**
 * The markers of the markup a text carries unescaped. Counted by regular
 * expression and not by walking the characters: the help is full of emoji,
 * and a surrogate pair puts the two ways of indexing a string out of step.
 */
const bare = (text: string, marker: string) => {
	const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
	const unescaped = new RegExp(String.raw`(?<!\\)` + escaped, "g")

	return (text.match(unescaped) || []).length
}

const MARKERS = ["§", "+", "`", "!", "$", "_", "#"]

describe("the help of the base commands", () => {
	it("closes every marker it opens", () => {
		// the help wraps each command name in `+name+`: a bare marker in a
		// pattern — `font +` — pairs with one of those and colors everything
		// in between. An odd count is that bug, whichever marker it is
		const text = allHelp()

		MARKERS.forEach(marker => {
			expect([marker, bare(text, marker) % 2]).toEqual([marker, 0])
		})
	})

	it("closes them in the help of a single command too", () => {
		Object.keys(baseCommands).forEach(name => {
			const text = helpOf(name)

			MARKERS.forEach(marker => {
				expect([name, marker, bare(text, marker) % 2]).toEqual([
					name,
					marker,
					0,
				])
			})
		})
	})

	it("prints the size command with its plus escaped", () => {
		expect(helpOf("font")).toContain("font \\+")
	})
})
