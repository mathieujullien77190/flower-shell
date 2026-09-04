import {
	bareTheme,
	container,
	contrastTheme,
	DEFAULT_THEME_NAME,
	defaultTheme,
	flowerTheme,
	fonts,
	hibiscusTheme,
	kiwiTheme,
	lavenderTheme,
	mapleTheme,
	nestTheme,
	riceTheme,
	scrollbar,
	setTheme,
	setThemes,
	theme,
	themeByName,
	themeNames,
	themes,
	wearTheme,
} from "./index"
import { makeTheme } from "./base"

afterEach(() => {
	setThemes(themes)
	wearTheme(DEFAULT_THEME_NAME)
})

describe("the catalogue", () => {
	it("gathers the eight themes of the package under their names", () => {
		expect(themes).toEqual({
			flower: flowerTheme,
			hibiscus: hibiscusTheme,
			kiwi: kiwiTheme,
			contrast: contrastTheme,
			maple: mapleTheme,
			lavender: lavenderTheme,
			rice: riceTheme,
			nest: nestTheme,
		})
	})

	it("starts on the flower it is named after", () => {
		expect(defaultTheme).toBe(flowerTheme)
		expect(DEFAULT_THEME_NAME).toBe("flower")
	})
})

describe("what is mounted", () => {
	it("mounts exactly the names it is given, and nothing else", () => {
		setThemes({ kiwi: themes.kiwi })

		expect(themeNames()).toEqual(["kiwi"])
		expect(themeByName("maple")).toBeUndefined()
	})

	it("mounts none without an argument", () => {
		setThemes()

		expect(themeNames()).toEqual([])
	})

	it("lays a partial theme on the default one", () => {
		setThemes({ mine: { colors: { background: "#000000" } } })

		const mine = themeByName("mine")!

		expect(mine.colors.background).toBe("#000000")
		// what it says nothing about is the default theme's
		expect(mine.colors.textColor).toBe(defaultTheme.colors.textColor)
		expect(mine.prompt).toBe(defaultTheme.prompt)
	})
})

describe("what is worn", () => {
	it("wears the name it is given", () => {
		wearTheme("kiwi")

		expect(theme().prompt).toBe(themes.kiwi.prompt)
	})

	it("falls back on the first of the catalogue when the name is unknown", () => {
		setThemes({ maple: themes.maple, rice: themes.rice })
		wearTheme("nowhere")

		expect(theme().prompt).toBe(themes.maple.prompt)
	})

	it("falls back on the first of the catalogue when no name is given", () => {
		setThemes({ maple: themes.maple })
		wearTheme()

		expect(theme().prompt).toBe(themes.maple.prompt)
	})

	it("paints nothing when nothing is mounted", () => {
		setThemes()
		wearTheme()

		expect(theme()).toBe(bareTheme)
		expect(theme().colors.background).toBe("transparent")
	})
})

describe("setTheme", () => {
	it("lays what it is given on what is worn", () => {
		wearTheme("flower")
		setTheme({ colors: { background: "#123456" } })

		expect(theme().colors.background).toBe("#123456")
		expect(theme().prompt).toBe(flowerTheme.prompt)
	})

	it("keeps the prompt it wears when the new theme names none", () => {
		wearTheme("kiwi")
		setTheme({ colors: {} })

		expect(theme().prompt).toBe(themes.kiwi.prompt)
	})

	it("changes nothing when it is given nothing", () => {
		wearTheme("kiwi")
		setTheme()

		expect(theme().prompt).toBe(themes.kiwi.prompt)
	})
})

describe("the reading shortcuts", () => {
	it("hand the font and the box of what is worn", () => {
		wearTheme("contrast")

		expect(fonts()).toEqual(contrastTheme.fonts)
		expect(container()).toEqual(contrastTheme.container)
	})

	it("dress the scrollbar in the colors of the theme", () => {
		wearTheme("flower")

		expect(scrollbar()).toEqual({
			color: `${flowerTheme.colors.scrollbarThumb} ${flowerTheme.colors.scrollbarTrack}`,
			width: "thin",
		})
	})

	it("leave the scrollbar of the browser alone on a theme that paints nothing", () => {
		setThemes()
		wearTheme()

		expect(scrollbar()).toEqual({ color: "auto", width: "auto" })
	})
})

describe("makeTheme", () => {
	it("takes the prompt of the package when the theme names none", () => {
		const made = makeTheme({
			colors: {
				background: "#000000",
				textColor: "#ffffff",
				importantColor: "#ffffff",
				cmdColor: "#ffffff",
				restrictedColor: "#ffffff",
				infoColor: "#ffffff",
				appColor: "#ffffff",
			},
		})

		expect(made.prompt).toBe(">")
		// `invisible` is never given: it always equals the background
		expect(made.colors.invisible).toBe("#000000")
		// and the scrollbar goes with the palette
		expect(made.colors.scrollbarThumb).toBe("#ffffff")
		expect(made.colors.scrollbarTrack).toBe("#000000")
	})
})
