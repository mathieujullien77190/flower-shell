import { testCommand } from "./test"

const shown = () => testCommand.action({ name: "test", args: [], commands: {} })

const MARKERS = ["§", "+", "`", "!", "$", "_", "#"]

describe("the markup workbench", () => {
	it("is one the visitor may type", () => {
		expect(testCommand.restricted).toBe(false)
	})

	it("shows every marker, its source escaped and its rendering bare", () => {
		const text = shown()

		expect(text).toContain("\\§important\\§")
		expect(text).toContain("§important§")
		expect(text).toContain("\\_invisible\\_")
	})

	it("shows the tags of every marker but the invisible one", () => {
		const text = shown()

		expect(text).toContain("[§important§]")
		expect(text).not.toContain("[_invisible_]")
	})

	it("shows a clickable marker that runs hello", () => {
		expect(shown()).toContain("~ hello")
	})

	it("leaves no marker open: an odd count colors the rest of the screen", () => {
		const text = shown()

		// the markers of the markup are counted unescaped: the source column
		// writes them behind a backslash, and those do not open anything
		const bare = (marker: string) =>
			text.split(marker).length - 1 - (text.split("\\" + marker).length - 1)

		MARKERS.forEach(marker => {
			expect([marker, bare(marker) % 2]).toEqual([marker, 0])
		})
	})
})
