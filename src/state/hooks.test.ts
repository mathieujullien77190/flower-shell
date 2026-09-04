import { act, renderHook } from "@testing-library/react"

import type { Command } from "@types"
import { createInstance } from "./instance"
import {
	useAnimation,
	useCommands,
	useFontSize,
	useGetCommands,
	useGetCurrentCommand,
	useGetCursor,
	useGetLastCommand,
	useGetStart,
	useKeyboardOnFocus,
	useLang,
	useThemeName,
} from "./hooks"

const line = (over: Partial<Command> = {}): Command => ({
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

const shell = () => {
	const instance = createInstance()

	return { instance, actions: () => instance.store.getState() }
}

describe("the slices of the store", () => {
	it("reads the options of the shell", () => {
		const instance = createInstance({ lang: "fr", animation: false })

		expect(renderHook(() => useLang(instance)).result.current).toBe("fr")
		expect(renderHook(() => useAnimation(instance)).result.current).toBe(false)
		expect(renderHook(() => useKeyboardOnFocus(instance)).result.current).toBe(
			true
		)
		expect(renderHook(() => useThemeName(instance)).result.current).toBe(
			"flower"
		)
		expect(renderHook(() => useFontSize(instance)).result.current).toBeNull()
	})

	it("paints again when the slice it reads moves", () => {
		const { instance, actions } = shell()
		const { result } = renderHook(() => useLang(instance))

		act(() => actions().setLang("fr"))

		expect(result.current).toBe("fr")
	})

	it("hands the commands of the shell, its `commands` prop as it stands", () => {
		const { instance } = shell()
		const commands = { hello: { restricted: false, action: () => "hi" } }
		instance.setCommands(commands)

		expect(renderHook(() => useCommands(instance)).result.current).toBe(
			commands
		)
	})

	it("keeps two shells apart", () => {
		const one = createInstance()
		const two = createInstance()

		act(() => one.store.getState().setLang("fr"))

		expect(renderHook(() => useLang(two)).result.current).toBe("en")
	})
})

describe("the history", () => {
	it("puts the two lists back in the order they arrived in", () => {
		const { instance, actions } = shell()

		act(() => {
			actions().addCommand(
				line({ id: "a", name: "welcome", restricted: true, order: 0 })
			)
			actions().addCommand(line({ id: "b", order: 1 }))
		})

		expect(
			renderHook(() => useGetCommands(instance)).result.current.map(
				command => command.id
			)
		).toEqual(["a", "b"])
	})

	it("keeps the order of arrival when the commands carry none", () => {
		const { instance, actions } = shell()

		act(() => {
			actions().addCommand(line({ id: "a" }))
			actions().addCommand(line({ id: "b" }))
		})

		expect(
			renderHook(() => useGetCommands(instance)).result.current.map(
				command => command.id
			)
		).toEqual(["a", "b"])
	})

	it("leaves out what is not visible", () => {
		const { instance, actions } = shell()

		act(() => actions().addCommand(line({ id: "a" })))
		act(() => actions().clear())

		expect(renderHook(() => useGetCommands(instance)).result.current).toEqual(
			[]
		)
	})

	it("gives the last command the visitor played", () => {
		const { instance, actions } = shell()

		act(() => {
			actions().addCommand(line({ id: "a" }))
			actions().addCommand(line({ id: "b" }))
		})

		expect(
			renderHook(() => useGetLastCommand(instance)).result.current!.id
		).toBe("b")
	})

	it("answers null on a history nobody has written in", () => {
		const { instance } = shell()

		expect(
			renderHook(() => useGetLastCommand(instance)).result.current
		).toBeNull()
	})
})

describe("the cursor", () => {
	it("sits nowhere until the history is walked", () => {
		const { instance } = shell()

		expect(renderHook(() => useGetCursor(instance)).result.current).toBeNull()
		expect(
			renderHook(() => useGetCurrentCommand(instance)).result.current
		).toBeNull()
	})

	it("names the command it sits on", () => {
		const { instance, actions } = shell()

		act(() => {
			actions().addCommand(line({ id: "a" }))
			actions().moveCursor(-1)
		})

		expect(renderHook(() => useGetCursor(instance)).result.current).toBe(0)
		expect(
			renderHook(() => useGetCurrentCommand(instance)).result.current!.id
		).toBe("a")
	})
})

describe("the startup", () => {
	it("is over once the opening is written and nothing has been typed", () => {
		const { instance, actions } = shell()

		expect(renderHook(() => useGetStart(instance)).result.current).toBe(true)

		act(() =>
			actions().addCommand(line({ id: "a", restricted: true, name: "welcome" }))
		)
		expect(renderHook(() => useGetStart(instance)).result.current).toBe(false)

		act(() => actions().setIsRendered("a"))
		expect(renderHook(() => useGetStart(instance)).result.current).toBe(true)
	})

	it("is over for good as soon as the visitor plays a line", () => {
		const { instance, actions } = shell()

		act(() => actions().addCommand(line({ id: "a" })))

		expect(renderHook(() => useGetStart(instance)).result.current).toBe(false)
	})
})
