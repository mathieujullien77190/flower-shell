import { bareTheme, defaultTheme, mapleTheme, riceTheme, themes } from "."
import type { ShellTheme } from "./types"
import { themeTone } from "./tone"

const on = (background: string): ShellTheme => ({
	...defaultTheme,
	colors: { ...defaultTheme.colors, background },
})

describe("themeTone", () => {
	it("answers nothing without a theme", () => {
		expect(themeTone()).toBeNull()
	})

	it("reads a dark theme of the catalogue", () => {
		expect(themeTone(mapleTheme)).toBe("dark")
	})

	it("reads a light theme of the catalogue", () => {
		expect(themeTone(riceTheme)).toBe("light")
	})

	it("reads a six digit hexadecimal", () => {
		expect(themeTone(on("#ffffff"))).toBe("light")
		expect(themeTone(on("#000000"))).toBe("dark")
	})

	it("reads a three digit hexadecimal", () => {
		expect(themeTone(on("#fff"))).toBe("light")
		expect(themeTone(on("#012"))).toBe("dark")
	})

	it("reads an rgb() and an rgba()", () => {
		expect(themeTone(on("rgb(255, 255, 255)"))).toBe("light")
		expect(themeTone(on("rgba(0, 0, 0, 0.5)"))).toBe("dark")
	})

	it("weighs the channels the way the eye takes them", () => {
		// pure blue is dark, pure green is light, on the same 255
		expect(themeTone(on("#0000ff"))).toBe("dark")
		expect(themeTone(on("#00ff00"))).toBe("light")
	})

	it("answers nothing on a background it cannot read", () => {
		expect(themeTone(bareTheme)).toBeNull()
		expect(themeTone(on("rebeccapurple"))).toBeNull()
		expect(themeTone(on("linear-gradient(#fff, #000)"))).toBeNull()
		expect(themeTone(on("rgb(255, 255)"))).toBeNull()
	})
})

describe("the catalogue", () => {
	const tones = Object.entries(themes).map(
		([name, theme]) => [name, themeTone(theme)] as const
	)

	it("announces a tone for every theme", () => {
		expect(tones.filter(([, tone]) => tone === null)).toEqual([])
	})

	it("holds four dark themes and three light ones", () => {
		// `flower` and the three dark ones on one side, the three light on the
		// other: a palette reworked out of that balance shows up here
		expect(
			tones.filter(([, tone]) => tone === "dark").map(([name]) => name)
		).toEqual(["flower", "hibiscus", "sunflower", "maple"])
		expect(
			tones.filter(([, tone]) => tone === "light").map(([name]) => name)
		).toEqual(["lavender", "rice", "nest"])
	})

	it("wears an emoji for a prompt", () => {
		Object.values(themes).forEach(theme =>
			expect(theme.prompt).toMatch(/\p{Extended_Pictographic}/u)
		)
	})
})
