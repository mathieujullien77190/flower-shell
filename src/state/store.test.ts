import type { Command } from "@types"
import { setThemes, themes } from "@theme"
import { createActions, initialData, type ShellData } from "./store"

const command = (over: Partial<Command> = {}): Command => ({
	pattern: "hello",
	name: "hello",
	args: [],
	result: "hi",
	restricted: false,
	id: "1-hello-0",
	canExecute: true,
	isRendered: false,
	...over,
})

/** the actions written against a store held here, the way an instance does */
const store = (start: ShellData = initialData()) => {
	let data = start

	const actions = createActions(change => {
		data = change(data)
	}, start)

	return { actions, read: () => data }
}

describe("initialData", () => {
	it("answers the defaults of the package", () => {
		expect(initialData()).toMatchObject({
			lang: "en",
			animation: true,
			keyboardOnFocus: true,
			commands: [],
			restrictedCommands: [],
			cursor: null,
		})
	})

	it("takes the options it is given", () => {
		expect(initialData({ lang: "fr", animation: false })).toMatchObject({
			lang: "fr",
			animation: false,
			keyboardOnFocus: true,
		})
	})

	it("keeps the default of an option left out", () => {
		expect(initialData({ lang: undefined }).lang).toBe("en")
	})
})

describe("addCommand", () => {
	it("adds a command of the visitor and puts the cursor back", () => {
		const { actions, read } = store()

		actions.moveCursor(-1)
		actions.addCommand(command())

		expect(read().commands).toHaveLength(1)
		expect(read().commands[0].visible).toBe(true)
		expect(read().cursor).toBeNull()
	})

	it("keeps a restricted command in its own list", () => {
		const { actions, read } = store()

		actions.addCommand(command({ restricted: true }))

		expect(read().commands).toHaveLength(0)
		expect(read().restrictedCommands).toHaveLength(1)
	})

	it("hides the clear command itself", () => {
		const { actions, read } = store()

		actions.addCommand(command({ name: "clear" }))

		expect(read().commands[0].visible).toBe(false)
	})
})

describe("setIsRendered", () => {
	it("marks a command as written", () => {
		const { actions, read } = store()

		actions.addCommand(command())
		actions.setIsRendered("1-hello-0")

		expect(read().commands[0].isRendered).toBe(true)
	})

	it("changes nothing on a command already written", () => {
		const { actions, read } = store()

		actions.addCommand(command())
		actions.setIsRendered("1-hello-0")
		const before = read()

		actions.setIsRendered("1-hello-0")

		// same object: an identical value must wake no render
		expect(read()).toBe(before)
	})
})

describe("clear", () => {
	it("hides every command without losing them", () => {
		const { actions, read } = store()

		actions.addCommand(command())
		actions.addCommand(command({ id: "2", restricted: true }))
		actions.clear()

		expect(read().commands[0].visible).toBe(false)
		expect(read().restrictedCommands[0].visible).toBe(false)
		expect(read().commands).toHaveLength(1)
	})
})

describe("moveCursor", () => {
	it("lands on the last command from the blank line", () => {
		const { actions, read } = store()

		actions.addCommand(command({ id: "a" }))
		actions.addCommand(command({ id: "b" }))
		actions.moveCursor(-1)

		expect(read().cursor).toBe(1)
	})

	it("goes back up the history", () => {
		const { actions, read } = store()

		actions.addCommand(command({ id: "a" }))
		actions.addCommand(command({ id: "b" }))
		actions.moveCursor(-1)
		actions.moveCursor(-1)

		expect(read().cursor).toBe(0)
	})

	it("stops at the top of the history", () => {
		const { actions, read } = store()

		actions.addCommand(command({ id: "a" }))
		actions.moveCursor(-1)
		actions.moveCursor(-1)
		actions.moveCursor(-1)

		expect(read().cursor).toBe(-1)
	})

	it("stops at the blank line going back down", () => {
		const { actions, read } = store()

		actions.addCommand(command({ id: "a" }))
		actions.moveCursor(-1)
		actions.moveCursor(1)
		actions.moveCursor(1)

		expect(read().cursor).toBe(1)
	})
})

describe("the options", () => {
	it("takes a language, an animation and a focus", () => {
		const { actions, read } = store()

		actions.setLang("fr")
		actions.setAnimation(false)
		actions.setKeyboardOnFocus(false)

		expect(read()).toMatchObject({
			lang: "fr",
			animation: false,
			keyboardOnFocus: false,
		})
	})
})

describe("setThemeName", () => {
	it("takes the name of a mounted theme", () => {
		setThemes(themes)
		const { actions, read } = store()

		actions.setThemeName("lavender")

		expect(read().themeName).toBe("lavender")
	})

	it("does nothing on a theme that is not mounted", () => {
		setThemes({ lavender: themes.lavender })
		const { actions, read } = store()
		const before = read().themeName

		actions.setThemeName("hibiscus")

		expect(read().themeName).toBe(before)
	})
})

describe("reset", () => {
	it("goes back to the values the shell was mounted on", () => {
		const start = initialData({ lang: "de" })
		const { actions, read } = store(start)

		actions.addCommand(command())
		actions.setLang("en")
		actions.reset()

		expect(read().lang).toBe("de")
		expect(read().commands).toHaveLength(0)
	})
})
