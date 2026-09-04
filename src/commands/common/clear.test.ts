import type { Command } from "@types"
import { createInstance, withInstance } from "@state/instance"
import { clearCommand } from "./clear"

const line = (): Command => ({
	pattern: "hello",
	name: "hello",
	args: [],
	result: "hi",
	restricted: false,
	id: "1-hello-0",
	canExecute: true,
	isRendered: false,
})

describe("clear", () => {
	it("shows nothing of its own", () => {
		expect(clearCommand.action({ name: "clear", args: [], commands: {} })).toBe(
			""
		)
	})

	it("hides what is on screen without losing the history", () => {
		const instance = createInstance()
		instance.store.getState().addCommand(line())

		withInstance(instance, () => clearCommand.effect!({ args: [] }))

		expect(instance.store.getState().commands).toHaveLength(1)
		expect(instance.store.getState().commands[0].visible).toBe(false)
	})
})
