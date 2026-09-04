import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import type { BaseCommand, Command as Line } from "@types"
import { flowerTheme, setTheme } from "@theme"
import Command from "./index"

beforeAll(() => setTheme(flowerTheme))

const line = (over: Partial<Line> = {}): Line => ({
	pattern: "hello you",
	name: "hello",
	args: ["you"],
	result: "Hello you",
	restricted: false,
	id: "1-hello-0",
	canExecute: true,
	isRendered: true,
	...over,
})

/**
 * The command laid down as the terminal lays it: written already, so the
 * text is there in one go — the unrolling has a test of its own, on the hook
 * that does it.
 */
const show = (
	over: Partial<React.ComponentProps<typeof Command>> = {},
	baseCommand: BaseCommand | null = null
) =>
	render(
		<Command
			command={line()}
			baseCommand={baseCommand}
			canRendered
			animation={false}
			{...over}
		/>
	)

describe("what is shown", () => {
	it("writes the line that was played, and its answer", () => {
		show()

		expect(screen.getByText(/hello you/)).toBeInTheDocument()
		expect(screen.getByText("Hello you")).toBeInTheDocument()
	})

	it("puts the prompt of the theme before the line, unread", () => {
		const { container } = show()

		expect(container.querySelector("strong")).toHaveTextContent(
			flowerTheme.prompt
		)
		expect(container.querySelector("strong")).toHaveAttribute(
			"aria-hidden",
			"true"
		)
	})

	it("shows nothing before its turn comes", () => {
		const { container } = show({ canRendered: false })

		expect(container).toBeEmptyDOMElement()
	})

	it("hides the line of a command that asks for it", () => {
		show({}, { restricted: true, action: () => "", display: { hideCmd: true } })

		expect(screen.queryByText(/hello you/)).toBeNull()
		expect(screen.getByText("Hello you")).toBeInTheDocument()
	})

	it("colors the line of a restricted command apart", () => {
		const { container } = show({ command: line({ restricted: true }) })

		expect(container.querySelector("span")).toBeInTheDocument()
	})

	it("shows no answer at all when the command wrote none", () => {
		const { container } = show({ command: line({ result: "" }) })

		expect(screen.getByText(/hello you/)).toBeInTheDocument()
		expect(container.querySelector("pre")).toBeNull()
	})

	it("says it is busy until the writing is done", () => {
		const { container } = show()

		expect(container.querySelector("[aria-busy]")).toHaveAttribute(
			"aria-busy",
			"false"
		)
	})
})

describe("what the command asks for", () => {
	it("takes the style it gives the block and the answer", () => {
		const { container } = show(
			{},
			{
				restricted: false,
				action: () => "",
				display: {
					style: { alignItems: "center" },
					stylePre: { fontSize: "20px" },
				},
			}
		)

		expect(container.querySelector("[aria-busy]")).toHaveStyle({
			alignItems: "center",
		})
		expect(container.querySelector("pre")).toHaveStyle({ fontSize: "20px" })
	})

	it("takes the animation of the command over the one of the shell", () => {
		// the shell writes letter by letter, this command does not: written
		// straight out, and reported written at once
		const onRendered = jest.fn()
		show(
			{ animation: true, command: line({ isRendered: false }), onRendered },
			{ restricted: false, action: () => "", display: { animation: false } }
		)

		expect(screen.getByText("Hello you")).toBeInTheDocument()
		expect(onRendered).toHaveBeenCalled()
	})

	it("colors its answer itself when it says how", () => {
		show(
			{},
			{
				restricted: false,
				action: () => "",
				display: { highlight: text => <em>{text}</em> },
			}
		)

		expect(screen.getByText("Hello you").tagName).toBe("EM")
	})

	it("draws its own JSX under the answer", () => {
		show(
			{},
			{
				restricted: false,
				action: () => "",
				JSX: ({ args }: { args: string[] }) => <b>{args.join(" ")}</b>,
			}
		)

		expect(screen.getByText("you").tagName).toBe("B")
	})
})

describe("what it reports", () => {
	it("says the writing is over", () => {
		const onRendered = jest.fn()
		show({ onRendered })

		expect(onRendered).toHaveBeenCalled()
	})

	it("reports the scroll on every step of the writing", () => {
		const onAnimate = jest.fn()
		show({ onAnimate })

		expect(onAnimate).toHaveBeenCalled()
	})

	it("clicks a marker with nobody listening", async () => {
		render(
			<Command
				command={line({ result: "#run ~ hello#" })}
				baseCommand={null}
				canRendered
				animation={false}
			/>
		)

		await userEvent.click(screen.getByRole("button"))

		expect(screen.getByRole("button")).toBeInTheDocument()
	})

	it("reports nothing to nobody: the callbacks are all optional", () => {
		expect(() =>
			render(
				<Command
					command={line()}
					baseCommand={null}
					canRendered
					animation={false}
				/>
			)
		).not.toThrow()
	})
})
