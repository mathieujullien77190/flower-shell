import type { CSSProperties, ReactNode } from "react"
import { render } from "@testing-library/react"

import { title, titleCommand } from "./title"
import { themes } from "@theme"

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

	it("measures it on the logo size of the theme rendering it", () => {
		const style = titleCommand.display!.stylePre as (
			theme: typeof themes.flower
		) => CSSProperties

		expect(style(themes.flower).fontSize).toBe(themes.flower.fonts.logo)
		expect(style(themes.contrast).fontSize).toBe(themes.contrast.fonts.logo)
	})

	it("colors the logo on the markers written into it", () => {
		const painted = titleCommand.display!.highlight!(
			"IlitI",
			themes.flower
		) as ReactNode[]

		expect(render(<div>{painted}</div>).container.textContent).toBe("lit")
	})

	it("hides the line that played it", () => {
		expect(titleCommand.display!.hideCmd).toBe(true)
	})
})
