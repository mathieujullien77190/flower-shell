import {
	createInstance,
	playingInstance,
	shellActions,
	withInstance,
} from "./instance"

describe("createInstance", () => {
	it("opens on the options it is given", () => {
		expect(createInstance({ lang: "fr" }).data().lang).toBe("fr")
	})

	it("reads a change back before any render", () => {
		const instance = createInstance()

		instance.actions.setLang("fr")

		expect(instance.data().lang).toBe("fr")
	})

	it("tells the watcher what the values became", () => {
		const instance = createInstance()
		const watch = jest.fn()

		instance.onChange(watch)
		instance.actions.setLang("fr")

		expect(watch).toHaveBeenCalledTimes(1)
		expect(watch.mock.calls[0][0].lang).toBe("fr")
	})

	it("wakes nobody when the values did not move", () => {
		const instance = createInstance()
		const watch = jest.fn()

		instance.onChange(watch)
		// an unmounted theme: the action answers the same values
		instance.actions.setThemeName("nothing-mounted")

		expect(watch).not.toHaveBeenCalled()
	})

	it("holds its commands and its listeners", () => {
		const instance = createInstance()
		const commands = { hello: { restricted: false, action: () => "hi" } }
		const listeners = { done: jest.fn() }

		instance.setCommands(commands)
		instance.setListeners(listeners)

		expect(instance.commands()).toBe(commands)
		expect(instance.listeners()).toBe(listeners)
	})

	it("gives two shells two states", () => {
		const one = createInstance()
		const two = createInstance()

		one.actions.setLang("fr")

		expect(two.data().lang).toBe("en")
	})
})

describe("withInstance", () => {
	it("posts the shell for the time of the call, and takes it back after", () => {
		const instance = createInstance()

		expect(playingInstance()).toBeNull()

		withInstance(instance, () => {
			expect(playingInstance()).toBe(instance)
		})

		expect(playingInstance()).toBeNull()
	})

	it("gives back what was played", () => {
		expect(withInstance(createInstance(), () => 42)).toBe(42)
	})

	it("takes the shell back down even on a throw", () => {
		expect(() =>
			withInstance(createInstance(), () => {
				throw new Error("boom")
			})
		).toThrow("boom")

		expect(playingInstance()).toBeNull()
	})

	it("gives the outer shell back to a nested call", () => {
		const outer = createInstance()
		const inner = createInstance()

		withInstance(outer, () => {
			withInstance(inner, () => {})
			expect(playingInstance()).toBe(outer)
		})
	})
})

describe("shellActions", () => {
	it("hands the values and the actions of the shell in play", () => {
		const instance = createInstance({ lang: "fr" })

		withInstance(instance, () => {
			const state = shellActions()

			expect(state.lang).toBe("fr")
			state.setAnimation(false)
		})

		expect(instance.data().animation).toBe(false)
	})

	it("refuses outside of a command", () => {
		expect(() => shellActions()).toThrow("only reachable while a command plays")
	})
})
