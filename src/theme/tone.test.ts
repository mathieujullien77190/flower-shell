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

	it("holds five dark themes and three light ones", () => {
		// the dark ones on one side, the light on the other: a palette
		// reworked out of that balance shows up here
		expect(
			tones.filter(([, tone]) => tone === "dark").map(([name]) => name)
		).toEqual(["flower", "hibiscus", "kiwi", "contrast", "maple"])
		expect(
			tones.filter(([, tone]) => tone === "light").map(([name]) => name)
		).toEqual(["lavender", "rice", "nest"])
	})

	it("gives the reading theme bigger letters than the others", () => {
		expect(themes.contrast.fonts.size).toBeGreaterThan(themes.flower.fonts.size)
	})

	it("holds every accent of the reading theme above 7:1 on its ground", () => {
		// what WCAG asks at its highest level, on the one theme that is there
		// for that: the plain red and the plain magenta do not reach it
		const channel = (hex: string, index: number) => {
			const value = parseInt(hex.slice(index, index + 2), 16) / 255
			return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
		}
		const luminance = (hex: string) =>
			0.2126 * channel(hex, 1) +
			0.7152 * channel(hex, 3) +
			0.0722 * channel(hex, 5)

		// the three that are not ink: two of them are the ground itself
		const {
			background,
			invisible: _invisible,
			scrollbarTrack: _scrollbarTrack,
			...inked
		} = themes.contrast.colors
		const ground = luminance(background)

		Object.entries(inked).forEach(([name, color]) => {
			const ratio = (luminance(color) + 0.05) / (ground + 0.05)
			expect([name, ratio >= 7]).toEqual([name, true])
		})
	})

	it("wears an emoji for a prompt", () => {
		Object.values(themes).forEach(theme =>
			expect(theme.prompt).toMatch(/\p{Extended_Pictographic}/u)
		)
	})
})
