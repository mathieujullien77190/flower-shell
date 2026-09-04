import type { ReactNode } from "react"
import { render } from "@testing-library/react"

import { flowersCommand, plantFlowers } from "./flowers"

describe("plantFlowers", () => {
	it("draws a field nine lines tall", () => {
		expect(plantFlowers().split("\n")).toHaveLength(9)
	})

	it("plants nine flowers, each in its own color", () => {
		const markers = plantFlowers().match(/[RIBTJHXDZ]/g) || []

		// each marker opens and closes around what it colors: an odd count is
		// a color running to the end of the drawing
		expect(new Set(markers).size).toBe(9)
		expect(markers.length % 2).toBe(0)
	})

	it("draws a different field every time", () => {
		expect(plantFlowers()).not.toBe(plantFlowers())
	})
})

describe("the flowers command", () => {
	it("is one the visitor may type", () => {
		expect(flowersCommand.restricted).toBe(false)
	})

	it("plants a field when it is played", () => {
		const played = flowersCommand.action({
			name: "flowers",
			args: [],
			commands: {},
		})

		expect(played.split("\n")).toHaveLength(9)
	})

	it("writes it backwards, letter by letter: it grows from the ground", () => {
		expect(flowersCommand.display).toMatchObject({
			reverse: true,
			stepTime: 1,
			stepSize: 1,
		})
	})

	it("measures the drawing on the width of the container", () => {
		expect(flowersCommand.display!.stylePre!.fontSize).toBe("calc(100cqw/60)")
	})

	it("colors the field on its markers, at the size it drew it", () => {
		const painted = flowersCommand.display!.highlight!("R@@@@R") as ReactNode[]

		expect(render(<div>{painted}</div>).container.textContent).toBe("@@@@")
	})
})
