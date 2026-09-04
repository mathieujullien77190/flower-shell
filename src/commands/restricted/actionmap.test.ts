import type { BaseCommand } from "@types"
import { createInstance, withInstance } from "@state/instance"
import { actionmapCommand } from "./actionmap"

const hello: BaseCommand = {
	restricted: false,
	action: ({ args }) => `Hello ${args.join(" ")}`,
}

const click = (args: string[]) => {
	const instance = createInstance({ animation: false })
	instance.setCommands({ hello, actionmap: actionmapCommand })

	withInstance(instance, () => actionmapCommand.effect!({ args }))

	return instance.store.getState().commands
}

describe("actionmap", () => {
	it("is restricted: a marker sends it, the visitor cannot type it", () => {
		expect(actionmapCommand.restricted).toBe(true)
	})

	it("shows nothing of its own", () => {
		expect(
			actionmapCommand.action({ name: "actionmap", args: [], commands: {} })
		).toBe("")
	})

	it("hides the line that played it", () => {
		expect(actionmapCommand.display!.hideCmd).toBe(true)
	})

	it("falls back on an empty line when it is handed no arguments", () => {
		const instance = createInstance({ animation: false })
		instance.setCommands({ hello, actionmap: actionmapCommand })

		// `args` left out entirely: a marker pointing at nothing sends
		// nothing, and the shell answers it the way it answers any unknown line
		withInstance(instance, () =>
			actionmapCommand.effect!({} as { args: string[] })
		)

		expect(instance.store.getState().commands[0].pattern).toBe("")
	})

	it("plays the line the marker points at, arguments included", () => {
		const played = click(["hello", "you"])

		expect(played).toHaveLength(1)
		expect(played[0].pattern).toBe("hello you")
		expect(played[0].result).toBe("Hello you")
	})
})
