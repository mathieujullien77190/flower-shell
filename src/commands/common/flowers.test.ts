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
})
