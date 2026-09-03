import { cleanCommand, hasSelection } from "./helpers"

describe("cleanCommand", () => {
	it("trims what is around the line", () => {
		expect(cleanCommand("  help  ")).toBe("help")
	})

	it("brings the line down to lower case", () => {
		expect(cleanCommand("HeLp")).toBe("help")
	})

	it("drops the accents", () => {
		expect(cleanCommand("thème créé")).toBe("theme cree")
	})

	it("leaves the inner spaces alone", () => {
		expect(cleanCommand(" Theme Lavender ")).toBe("theme lavender")
	})
})

describe("hasSelection", () => {
	const select = (text: string) => {
		const node = document.createElement("p")
		node.textContent = text
		document.body.appendChild(node)

		const range = document.createRange()
		range.selectNodeContents(node)

		const selection = window.getSelection()
		selection?.removeAllRanges()
		selection?.addRange(range)
	}

	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ""
	})

	it("answers no when nothing is selected", () => {
		expect(hasSelection()).toBe(false)
	})

	it("answers yes on a selected text", () => {
		select("some text")

		expect(hasSelection()).toBe(true)
	})

	it("does not take a selection of blanks for one", () => {
		select("   ")

		expect(hasSelection()).toBe(false)
	})
})
