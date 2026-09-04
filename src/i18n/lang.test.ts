import type { Dict } from "@types"
import { createInstance, withInstance } from "@state/instance"
import { dictEn } from "./en"
import { dictFr } from "./fr"
import { BASE_LANG, browserLang, langs, setDict, t } from "./lang"

// the dictionaries live at module level, shared by every shell: each test
// puts them back where it found them
afterEach(() => setDict())

/** every dotted path of a dictionary, leaves only */
const paths = (dict: Dict, prefix = ""): string[] =>
	Object.entries(dict).flatMap(([key, value]) =>
		typeof value === "string"
			? `${prefix}${key}`
			: paths(value, `${prefix}${key}.`)
	)

describe("the dictionaries of the package", () => {
	it("says the same things in French as in English", () => {
		// a key added to one and forgotten in the other comes out in English
		// on a French shell, and nothing else would say so
		expect(paths(dictEn).filter(key => !paths(dictFr).includes(key))).toEqual(
			[]
		)
	})

	it("says nothing in French the English does not carry", () => {
		expect(paths(dictFr).filter(key => !paths(dictEn).includes(key))).toEqual(
			[]
		)
	})
})

describe("the dictionaries of a shell", () => {
	it("speaks English alone until it is given more", () => {
		const instance = createInstance()

		withInstance(instance, () => expect(langs()).toEqual([BASE_LANG]))
	})

	it("mounts exactly the languages it is given", () => {
		const instance = createInstance()
		instance.setDict({ en: {}, fr: dictFr })

		withInstance(instance, () => expect(langs()).toEqual(["en", "fr"]))
	})

	it("mounts a language given nothing of its own", () => {
		// the key is there, its dictionary is not: English answers for it
		const instance = createInstance({ lang: "de" })
		instance.setDict({ en: dictEn, de: undefined as unknown as Dict })

		withInstance(instance, () => {
			expect(langs()).toEqual(["en", "de"])
			expect(t("hello.world")).toBe("Hello world")
		})
	})

	it("answers the key itself once every dictionary is emptied", () => {
		const instance = createInstance()
		instance.setDict({})

		withInstance(instance, () => {
			expect(langs()).toEqual([])
			expect(t("hello.world")).toBe("hello.world")
		})
	})

	it("lays each language on the English of the package", () => {
		const instance = createInstance({ lang: "de" })
		instance.setDict({ de: { error: { args: "falsches Argument" } } })

		withInstance(instance, () => {
			expect(t("error.args")).toBe("falsches Argument")
			// a key the given dictionary does not cover comes out in English
			expect(t("error.unknown", { name: "x" })).toContain("not recognised")
		})
	})

	it("keeps two shells out of each other", () => {
		const french = createInstance({ lang: "fr" })
		french.setDict({ en: dictEn, fr: dictFr })
		const bare = createInstance()

		withInstance(french, () => expect(langs()).toEqual(["en", "fr"]))
		// the neighbour speaks two languages: this one still speaks one
		withInstance(bare, () => expect(langs()).toEqual([BASE_LANG]))
	})
})

describe("setDict", () => {
	it("answers t() played outside of any shell", () => {
		setDict({ en: { error: { args: "outside" } } })

		expect(t("error.args")).toBe("outside")

		setDict()
	})

	it("does not reach into the shells of the page", () => {
		setDict({ en: { error: { args: "outside" } } })
		const instance = createInstance()

		withInstance(instance, () =>
			expect(t("error.args")).toBe("unrecognised argument(s)")
		)

		setDict()
	})
})

describe("t", () => {
	it("reads a dotted path", () => {
		expect(t("error.args")).toBe("unrecognised argument(s)")
	})

	it("gives a missing key back as it is", () => {
		expect(t("plain text, not a key")).toBe("plain text, not a key")
	})

	it("replaces the variables of the text", () => {
		expect(t("error.unknown", { name: "nope" })).toContain("nope is not")
	})

	it("replaces a variable everywhere it shows", () => {
		expect(t("{a} and {a}", { a: "x" })).toBe("x and x")
	})

	it("takes a number as well as a text", () => {
		expect(t("{n} left", { n: 2 })).toBe("2 left")
	})

	it("answers in the language of the shell in play", () => {
		const instance = createInstance({ lang: "fr" })
		instance.setDict({ en: {}, fr: dictFr })

		withInstance(instance, () => {
			expect(t("error.args")).toBe("argument(s) non reconnu")
		})
	})

	it("answers in the fallback language outside of a command", () => {
		expect(t("error.args")).toBe("unrecognised argument(s)")
	})

	it("takes a forced language over the one of the shell", () => {
		const instance = createInstance({ lang: "en" })
		instance.setDict({ en: {}, fr: dictFr })

		withInstance(instance, () => {
			expect(t("error.args", undefined, "fr")).toBe("argument(s) non reconnu")
		})
	})

	it("falls back on English on a language that is not mounted", () => {
		const instance = createInstance({ lang: "de" })

		withInstance(instance, () => {
			expect(t("error.args")).toBe("unrecognised argument(s)")
		})
	})
})

describe("browserLang", () => {
	const languages = (value?: string[]) =>
		Object.defineProperty(navigator, "languages", {
			value,
			configurable: true,
		})

	afterEach(() => languages(undefined))

	it("takes the language of the visitor when the shell speaks it", () => {
		setDict({ en: {}, fr: dictFr })
		languages(["fr-FR", "en-US"])

		expect(browserLang()).toBe("fr")
	})

	it("takes the fallback language when the shell does not speak it", () => {
		setDict({ en: {}, fr: dictFr })
		languages(["de-DE"])

		expect(browserLang()).toBe(BASE_LANG)
	})

	it("reads the single language of a browser that lists none", () => {
		setDict({ en: {}, fr: dictFr })
		languages(undefined)
		const single = jest
			.spyOn(navigator, "language", "get")
			.mockReturnValue("fr-FR")

		expect(browserLang()).toBe("fr")

		single.mockRestore()
	})

	it("answers the fallback language on a browser that names none", () => {
		setDict({ en: {}, fr: dictFr })
		languages(undefined)
		const none = jest.spyOn(navigator, "language", "get").mockReturnValue("")

		expect(browserLang()).toBe(BASE_LANG)

		none.mockRestore()
	})

	it("answers the fallback language where there is no navigator at all", () => {
		// what a prerender is: the module is read on a server, and the
		// starting language cannot be the visitor's
		const real = global.navigator
		// @ts-expect-error — deleting it is the whole point
		delete global.navigator

		expect(browserLang()).toBe(BASE_LANG)

		Object.defineProperty(global, "navigator", {
			value: real,
			configurable: true,
		})
	})
})
