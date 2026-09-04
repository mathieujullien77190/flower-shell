import { render } from "@testing-library/react"

import { setThemes, themes, wearTheme } from "@theme"
import { highlightFlower } from "./highlight"

beforeAll(() => {
	setThemes(themes)
	wearTheme("flower")
})

const paint = (text: string) =>
	render(<div>{highlightFlower(text, { fontSize: "12px" })}</div>).container

describe("highlightFlower", () => {
	it("leaves a text without markers as it is", () => {
		expect(paint("plain").textContent).toBe("plain")
	})

	it("colors what a marker wraps, and drops the marker", () => {
		const painted = paint("Ilit upI")
		const span = painted.querySelector("span")

		expect(painted.textContent).toBe("lit up")
		expect(span).not.toBeNull()
		expect(span!.style.color).not.toBe("")
	})

	it("gives the wrapped part the base style it is handed", () => {
		expect(paint("Ilit upI").querySelector("span")!.style.fontSize).toBe("12px")
	})

	it("reads two markers of its own in the same text", () => {
		expect(paint("IoneI BtwoB").querySelectorAll("span")).toHaveLength(2)
	})
})
