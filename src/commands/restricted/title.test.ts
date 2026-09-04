import { title, titleCommand } from "./title"
import { fonts } from "@theme"

describe("the logo", () => {
	it("carries the color markers of highlightFlower", () => {
		expect(title).toMatch(/R.*R/)
		expect(title).toMatch(/I.*I/)
	})
})

describe("the title command", () => {
	it("is restricted: the banner plays it, the visitor cannot", () => {
		expect(titleCommand.restricted).toBe(true)
	})

	it("draws the logo", () => {
		expect(titleCommand.action({ name: "title", args: [], commands: {} })).toBe(
			title
		)
	})

	it("measures it on the logo size of the theme", () => {
		expect(titleCommand.display!.stylePre!.fontSize).toBe(fonts().logo)
	})

	it("hides the line that played it", () => {
		expect(titleCommand.display!.hideCmd).toBe(true)
	})
})
