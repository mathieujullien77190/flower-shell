import { act, renderHook } from "@testing-library/react"

import { useDisplayByLetter } from "./hooks"

const unroll = (over: Partial<Parameters<typeof useDisplayByLetter>[0]> = {}) =>
	renderHook(() =>
		useDisplayByLetter({
			baseTxt: "hello",
			canRendered: true,
			animation: true,
			...over,
		})
	)

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

/** one turn of the timer, the way the interval fires it */
const tick = (times = 1) => act(() => jest.advanceTimersByTime(10 * times))

describe("without the animation", () => {
	it("lays the text down whole, and says it is written", () => {
		const { result } = unroll({ animation: false })

		expect(result.current).toEqual({ txt: "hello", finish: true })
	})
})

describe("letter by letter", () => {
	it("shows nothing before the first turn", () => {
		expect(unroll().result.current).toEqual({ txt: "", finish: false })
	})

	it("writes one letter per turn", () => {
		const { result } = unroll()

		tick()
		expect(result.current.txt).toBe("h")

		tick()
		expect(result.current.txt).toBe("he")
	})

	it("says it is written once the last letter is laid down", () => {
		const { result } = unroll()

		tick(10)

		expect(result.current).toEqual({ txt: "hello", finish: true })
	})

	it("writes from the end when the command asks for it", () => {
		const { result } = unroll({ reverse: true })

		tick()
		expect(result.current.txt).toBe("o")

		tick()
		expect(result.current.txt).toBe("lo")
	})

	it("takes the step the command asks for", () => {
		const { result } = unroll({ baseTxt: "abcdefgh", stepSize: 4 })

		tick()
		expect(result.current.txt).toBe("a")

		tick()
		expect(result.current.txt).toBe("abcde")
	})

	it("takes the pace the command asks for", () => {
		const { result } = unroll({ stepTime: 100 })

		act(() => jest.advanceTimersByTime(10))
		expect(result.current.txt).toBe("")

		act(() => jest.advanceTimersByTime(100))
		expect(result.current.txt).toBe("h")
	})

	it("writes a long text several letters at a time", () => {
		// no step given: one hundredth of the text, and one letter at least
		const { result } = unroll({ baseTxt: "x".repeat(300) })

		tick()
		expect(result.current.txt).toHaveLength(1)

		tick()
		expect(result.current.txt).toHaveLength(5)
	})
})

describe("its turn to be written", () => {
	it("waits: a command writes after the one before it", () => {
		const { result } = unroll({ canRendered: false })

		tick(10)

		expect(result.current).toEqual({ txt: "", finish: false })
	})

	it("starts when its turn comes", () => {
		const { result, rerender } = renderHook(
			({ canRendered }) =>
				useDisplayByLetter({
					baseTxt: "hello",
					canRendered,
					animation: true,
				}),
			{ initialProps: { canRendered: false } }
		)

		tick(10)
		expect(result.current.finish).toBe(false)

		rerender({ canRendered: true })
		tick(10)

		expect(result.current).toEqual({ txt: "hello", finish: true })
	})

	it("drops its timer when the terminal is unmounted mid-writing", () => {
		const { unmount } = unroll({ baseTxt: "x".repeat(50) })

		tick()
		unmount()

		expect(jest.getTimerCount()).toBe(0)
	})
})
