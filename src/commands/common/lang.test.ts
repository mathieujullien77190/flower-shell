import { readHelp } from "@engine/terminalEngine"
import { setDict } from "@i18n/lang"
import { dictEn } from "@i18n/en"
import { dictFr } from "@i18n/fr"
import { createInstance, withInstance } from "@state/instance"
import { langCommand } from "./lang"

beforeEach(() => setDict({ en: dictEn, fr: dictFr }))
afterAll(() => setDict())

describe("lang", () => {
	it("takes the languages of the mounted dictionary, and nothing else", () => {
		const { authorize } = langCommand.testArgs!

		expect(typeof authorize === "function" && authorize()).toEqual(["en", "fr"])
	})

	it("announces the change in the language it is going to", () => {
		expect(
			langCommand.action({ name: "lang", args: ["fr"], commands: {} })
		).toBe("langage : fr")
	})

	it("speaks it", () => {
		const instance = createInstance()

		withInstance(instance, () => langCommand.effect!({ args: ["fr"] }))

		expect(instance.data().lang).toBe("fr")
	})

	it("lists the languages actually mounted", () => {
		expect(readHelp(langCommand)!.patterns).toEqual([
			{ pattern: "lang en", description: "lang.en" },
			{ pattern: "lang fr", description: "lang.fr" },
		])
	})
})
