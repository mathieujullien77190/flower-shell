import { createInstance, withInstance } from "@state/instance"
import { dictFr } from "./fr"
import { BASE_LANG, browserLang, langs, setDict, t } from "./lang"

// the dictionaries live at module level, shared by every shell: each test
// puts them back where it found them
afterEach(() => setDict())

describe("setDict", () => {
	it("speaks English alone until it is given more", () => {
		expect(langs()).toEqual([BASE_LANG])
	})

	it("mounts exactly the languages it is given", () => {
		setDict({ en: {}, fr: dictFr })

		expect(langs()).toEqual(["en", "fr"])
	})

	it("lays each language on the English of the package", () => {
		setDict({ de: { error: { args: "falsches Argument" } } })

		const instance = createInstance({ lang: "de" })

		withInstance(instance, () => {
			expect(t("error.args")).toBe("falsches Argument")
			// a key the given dictionary does not cover comes out in English
			expect(t("error.unknown", { name: "x" })).toContain("not recognised")
		})
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
		setDict({ en: {}, fr: dictFr })
		const instance = createInstance({ lang: "fr" })

		withInstance(instance, () => {
			expect(t("error.args")).toBe("argument(s) non reconnu")
		})
	})

	it("answers in the fallback language outside of a command", () => {
		setDict({ en: {}, fr: dictFr })

		expect(t("error.args")).toBe("unrecognised argument(s)")
	})

	it("takes a forced language over the one of the shell", () => {
		setDict({ en: {}, fr: dictFr })
		const instance = createInstance({ lang: "en" })

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
})
