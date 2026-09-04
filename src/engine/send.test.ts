import type { BaseCommand, BaseCommands } from "@types"
import { createInstance, type ShellInstance } from "@state/instance"
import { createRunners, runHere } from "./send"

const cmd = (over: Partial<BaseCommand> = {}): BaseCommand => ({
	restricted: false,
	action: () => "ok",
	...over,
})

const mount = (commands: BaseCommands): ShellInstance => {
	const instance = createInstance()
	instance.setCommands(commands)

	return instance
}

const listeners = () => ({
	start: jest.fn(),
	done: jest.fn(),
	error: jest.fn(),
})

describe("run", () => {
	it("adds the line to the history", () => {
		const instance = mount({ hello: cmd() })

		createRunners(instance).run("hello world")

		expect(instance.store.getState().commands).toHaveLength(1)
		expect(instance.store.getState().commands[0].pattern).toBe("hello world")
	})

	it("keeps a restricted line out of the visible history", () => {
		const instance = mount({ welcome: cmd({ restricted: true }) })

		createRunners(instance).runRestricted("welcome")

		expect(instance.store.getState().commands).toHaveLength(0)
		expect(instance.store.getState().restrictedCommands).toHaveLength(1)
	})

	it("plays the effect of the command", () => {
		const effect = jest.fn()
		const instance = mount({ hello: cmd({ effect }) })

		createRunners(instance).run("hello you")

		expect(effect).toHaveBeenCalledWith({ args: ["you"] })
	})

	it("leaves the effect alone when the arguments do not pass", () => {
		const effect = jest.fn()
		const instance = mount({
			theme: cmd({
				effect,
				testArgs: { authorize: ["lavender"], empty: false },
			}),
		})

		createRunners(instance).run("theme neon")

		expect(effect).not.toHaveBeenCalled()
	})

	it("plays the line on its own shell, and on no other", () => {
		const one = mount({ hello: cmd() })
		const two = mount({ hello: cmd() })

		createRunners(one).run("hello")

		expect(one.store.getState().commands).toHaveLength(1)
		expect(two.store.getState().commands).toHaveLength(0)
	})
})

describe("the listeners", () => {
	it("reports the start before the command plays", () => {
		const events: string[] = []
		const instance = mount({
			hello: cmd({ action: () => (events.push("action"), "ok") }),
		})
		instance.setListeners({ start: () => events.push("start") })

		createRunners(instance).run("hello")

		expect(events).toEqual(["start", "action"])
	})

	it("hands the line, whole and split", () => {
		const heard = listeners()
		const instance = mount({ hello: cmd() })
		instance.setListeners(heard)

		createRunners(instance).run("hello you two")

		expect(heard.start).toHaveBeenCalledWith({
			name: "hello",
			args: ["you", "two"],
			pattern: "hello you two",
		})
		expect(heard.done).toHaveBeenCalledTimes(1)
		expect(heard.error).not.toHaveBeenCalled()
	})

	it("reports an unknown command", () => {
		const heard = listeners()
		const instance = mount({ hello: cmd() })
		instance.setListeners(heard)

		createRunners(instance).run("nope")

		expect(heard.done).not.toHaveBeenCalled()
		expect(heard.error).toHaveBeenCalledWith(
			expect.objectContaining({ reason: "unknown", name: "nope" })
		)
	})

	it("reports arguments that do not pass", () => {
		const heard = listeners()
		const instance = mount({
			theme: cmd({ testArgs: { authorize: ["lavender"], empty: false } }),
		})
		instance.setListeners(heard)

		createRunners(instance).run("theme neon")

		expect(heard.error).toHaveBeenCalledWith(
			expect.objectContaining({ reason: "args" })
		)
	})

	it("reports an action that threw, and adds nothing to the history", () => {
		const heard = listeners()
		const boom = new Error("boom")
		const instance = mount({
			hello: cmd({
				action: () => {
					throw boom
				},
			}),
		})
		instance.setListeners(heard)

		createRunners(instance).run("hello")

		expect(heard.error).toHaveBeenCalledWith(
			expect.objectContaining({ reason: "thrown", error: boom })
		)
		expect(instance.store.getState().commands).toHaveLength(0)
	})

	it("keeps the line when the effect alone threw", () => {
		const heard = listeners()
		const instance = mount({
			hello: cmd({
				effect: () => {
					throw new Error("boom")
				},
			}),
		})
		instance.setListeners(heard)

		createRunners(instance).run("hello")

		expect(heard.error).toHaveBeenCalledWith(
			expect.objectContaining({ reason: "thrown" })
		)
		expect(instance.store.getState().commands).toHaveLength(1)
	})

	it("objects to nothing on a shell with no command", () => {
		const heard = listeners()
		const instance = mount({})
		instance.setListeners(heard)

		createRunners(instance).run("whatever")

		expect(heard.error).not.toHaveBeenCalled()
		expect(instance.store.getState().commands).toHaveLength(1)
	})
})

describe("runHere", () => {
	it("plays a line on the shell the command plays for", () => {
		const instance = mount({
			hello: cmd(),
			// the effect reaches its own terminal without naming it
			go: cmd({ effect: () => runHere("hello") }),
		})

		createRunners(instance).run("go")

		expect(instance.store.getState().commands.map(item => item.name)).toEqual([
			"hello",
			"go",
		])
	})

	it("refuses outside of a command", () => {
		expect(() => runHere("hello")).toThrow(
			"only reachable while a command plays"
		)
	})
})
