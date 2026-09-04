import { StrictMode } from "react"
import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Shell } from "./Shell"
import { baseCommands } from "./commands/base"
import { testCommand } from "./commands/common/test"
import { dictEn, dictFr } from "./index"
import { themes } from "./theme"
import type { BaseCommand } from "./types"

/** a shell mounted the way a consumer mounts one, its animation off */
const mount = async (props: Partial<React.ComponentProps<typeof Shell>> = {}) =>
	act(async () => {
		render(
			<Shell
				commands={baseCommands}
				themes={themes}
				theme="flower"
				animation={false}
				{...props}
			/>
		)
	})

const line = () => screen.getByRole("textbox")

const type = async (text: string) => {
	await userEvent.type(line(), `${text}{Enter}`)
}

describe("mounting", () => {
	it("shows a prompt and answers nothing until it is typed in", async () => {
		await mount()

		expect(line()).toBeInTheDocument()
		expect(screen.getByRole("log")).toBeEmptyDOMElement()
	})

	it("plays its opening, the restricted line hidden", async () => {
		await mount({ initialCommands: ["welcome"] })

		expect(await screen.findByText(/Welcome to/)).toBeInTheDocument()
		// `welcome` is restricted and hides the line that played it
		expect(screen.queryByText("welcome", { exact: true })).toBeNull()
	})

	it("plays the commands of the opening in the order they are written", async () => {
		await mount({ initialCommands: ["hello one", "hello two"] })

		const written = screen.getByRole("log").textContent

		expect(written!.indexOf("Hello one")).toBeLessThan(
			written!.indexOf("Hello two")
		)
	})

	it("plays its opening once, even when React mounts it twice", async () => {
		// what StrictMode does in development: the effects run a second time,
		// and the opening must find the screen already written
		await act(async () => {
			render(
				<StrictMode>
					<Shell
						commands={baseCommands}
						themes={themes}
						animation={false}
						initialCommands={["hello"]}
					/>
				</StrictMode>
			)
		})

		expect(await screen.findAllByText("Hello world")).toHaveLength(1)
	})

	it("mounts on nothing at all", async () => {
		await act(async () => {
			render(<Shell />)
		})

		expect(line()).toBeInTheDocument()
		expect(screen.getByRole("log")).toBeEmptyDOMElement()
	})

	it("mounts bare: no commands, and nothing is answered", async () => {
		await mount({ commands: {}, themes: undefined, theme: undefined })

		expect(line()).toBeInTheDocument()
	})
})

describe("what the visitor types", () => {
	it("plays a command and writes its answer", async () => {
		await mount()

		await type("hello")

		expect(await screen.findByText("Hello world")).toBeInTheDocument()
	})

	it("hands the arguments over", async () => {
		await mount()

		await type("hello you")

		expect(await screen.findByText("Hello you")).toBeInTheDocument()
	})

	it("answers a name it does not know", async () => {
		await mount()

		await type("nope")

		expect(await screen.findByText(/is not recognised/)).toBeInTheDocument()
	})

	it("answers a known command whose arguments do not pass", async () => {
		await mount()

		await type("animation sideways")

		expect(await screen.findByText(/unrecognised argument/)).toBeInTheDocument()
	})

	it("walks the history back with the up arrow", async () => {
		await mount()

		await type("hello")
		await userEvent.type(line(), "{ArrowUp}")

		expect(line()).toHaveValue("hello")
	})

	it("comes back down the history with the down arrow", async () => {
		await mount()

		await type("hello")
		await userEvent.type(line(), "{ArrowUp}{ArrowDown}")

		expect(line()).toHaveValue("")
	})
})

describe("the options, given as props", () => {
	it("speaks the language it is mounted in", async () => {
		await mount({
			lang: "fr",
			dict: { en: dictEn, fr: dictFr },
			initialCommands: ["welcome"],
		})

		expect(await screen.findByText(/Bienvenue/)).toBeInTheDocument()
	})

	it("takes a dictionary of the consumer's over the one of the package", async () => {
		await mount({
			dict: { en: { welcome: { text: "Welcome to acme" } } },
			initialCommands: ["welcome"],
		})

		expect(await screen.findByText("Welcome to acme")).toBeInTheDocument()
	})

	it("gives the keyboard back, or leaves it alone", async () => {
		await mount({ keyboardOnFocus: true })
		expect(line()).toHaveFocus()

		document.body.focus()
		expect(line()).toHaveFocus()
	})

	it("lets the page around it keep the keyboard", async () => {
		await mount({ keyboardOnFocus: false })

		expect(line()).not.toHaveFocus()
	})

	it("keeps its dictionary to itself", async () => {
		// two terminals side by side: one speaks two languages, the other one.
		// Neither writes into the other, whichever order they mount in.
		await act(async () => {
			render(
				<>
					<div data-testid="bare">
						<Shell commands={baseCommands} animation={false} />
					</div>
					<div data-testid="bilingual">
						<Shell
							commands={baseCommands}
							animation={false}
							dict={{ en: dictEn, fr: dictFr }}
						/>
					</div>
				</>
			)
		})

		const bare = within(screen.getByTestId("bare"))
		await userEvent.type(bare.getByRole("textbox"), "lang fr{Enter}")

		// French is not one of its languages: the argument does not pass
		expect(bare.getByRole("log")).toHaveTextContent("unrecognised argument")

		const bilingual = within(screen.getByTestId("bilingual"))
		await userEvent.type(bilingual.getByRole("textbox"), "lang fr{Enter}")

		expect(bilingual.getByRole("log")).toHaveTextContent("langage : fr")
	})

	it("wears the theme it is told to start on", async () => {
		// the prompt is the visible half of a theme: lavender wears 🪻
		await mount({ theme: "lavender" })

		expect(await screen.findByText("🪻")).toBeInTheDocument()
	})

	it("keeps its theme to itself", async () => {
		// two terminals side by side, two catalogues: switching one paints
		// only itself, and neither knows what the other carries
		await act(async () => {
			render(
				<>
					<div data-testid="left">
						<Shell
							commands={baseCommands}
							themes={themes}
							theme="flower"
							animation={false}
						/>
					</div>
					<div data-testid="right">
						<Shell
							commands={baseCommands}
							themes={{ kiwi: themes.kiwi }}
							theme="kiwi"
							animation={false}
						/>
					</div>
				</>
			)
		})

		const box = (id: string) =>
			screen.getByTestId(id).querySelector("[data-theme]")!

		expect(box("left")).toHaveAttribute("data-theme", "flower")
		expect(box("right")).toHaveAttribute("data-theme", "kiwi")

		const left = within(screen.getByTestId("left"))
		await userEvent.type(left.getByRole("textbox"), "theme maple{Enter}")

		expect(box("left")).toHaveAttribute("data-theme", "maple")
		expect(box("right")).toHaveAttribute("data-theme", "kiwi")

		// and maple is not one the right one carries
		const right = within(screen.getByTestId("right"))
		await userEvent.type(right.getByRole("textbox"), "theme maple{Enter}")

		expect(right.getByRole("log")).toHaveTextContent("unrecognised argument")
	})

	it("paints two terminals with two palettes", async () => {
		await act(async () => {
			render(
				<>
					<div data-testid="dark">
						<Shell
							commands={baseCommands}
							themes={{ kiwi: themes.kiwi }}
							animation={false}
						/>
					</div>
					<div data-testid="light">
						<Shell
							commands={baseCommands}
							themes={{ rice: themes.rice }}
							animation={false}
						/>
					</div>
				</>
			)
		})

		const ground = (id: string) =>
			getComputedStyle(screen.getByTestId(id).querySelector("[data-theme]")!)
				.background

		expect(ground("dark")).not.toBe(ground("light"))
	})

	it("switches theme when the visitor asks for another", async () => {
		const { container } = render(
			<Shell
				commands={baseCommands}
				themes={themes}
				theme="flower"
				animation={false}
			/>
		)

		await userEvent.type(screen.getByRole("textbox"), "theme kiwi{Enter}")

		await waitFor(() =>
			expect(container.querySelector("[data-theme]")).toHaveAttribute(
				"data-theme",
				"kiwi"
			)
		)
	})
})

describe("the listeners", () => {
	const listeners = () => ({
		onCommandStart: jest.fn(),
		onCommandDone: jest.fn(),
		onCommandRendered: jest.fn(),
		onCommandError: jest.fn(),
	})

	it("reports a command from its start to its writing", async () => {
		const watch = listeners()
		await mount(watch)

		await type("hello")

		const event = { name: "hello", args: [], pattern: "hello" }

		expect(watch.onCommandStart).toHaveBeenCalledWith(event)
		expect(watch.onCommandDone).toHaveBeenCalledWith(event)
		await waitFor(() =>
			expect(watch.onCommandRendered).toHaveBeenCalledWith(event)
		)
		expect(watch.onCommandError).not.toHaveBeenCalled()
	})

	it("reports the end of the writing once, and not on every render", async () => {
		const watch = listeners()
		await mount(watch)

		await type("hello")
		await type("hello")

		await waitFor(() =>
			expect(watch.onCommandRendered).toHaveBeenCalledTimes(2)
		)
	})

	it("names the reason a line did not play", async () => {
		const watch = listeners()
		await mount(watch)

		await type("nope")
		expect(watch.onCommandError).toHaveBeenCalledWith(
			expect.objectContaining({ reason: "unknown", pattern: "nope" })
		)

		await type("animation sideways")
		expect(watch.onCommandError).toHaveBeenCalledWith(
			expect.objectContaining({ reason: "args" })
		)
	})

	it("reports a command that throws, and keeps the shell standing", async () => {
		const boom: BaseCommand = {
			restricted: false,
			action: () => {
				throw new Error("boom, as advertised")
			},
		}
		const watch = listeners()
		await mount({ ...watch, commands: { ...baseCommands, boom } })

		await type("boom")

		expect(watch.onCommandError).toHaveBeenCalledWith(
			expect.objectContaining({ reason: "thrown" })
		)
		expect(line()).toBeInTheDocument()
	})
})

describe("the terminal itself", () => {
	it("plays the command a clickable marker points at", async () => {
		// `test` prints one: #click to run hello ~ hello#
		await mount({
			commands: { ...baseCommands, test: testCommand },
			initialCommands: ["test"],
		})

		await userEvent.click(await screen.findByRole("button"))

		expect(await screen.findByText("Hello world")).toBeInTheDocument()
	})

	it("leaves the keyboard alone on a click that selected text", async () => {
		await mount({ keyboardOnFocus: false })
		const selected = jest
			.spyOn(window, "getSelection")
			.mockReturnValue({ toString: () => "picked" } as Selection)

		await userEvent.click(screen.getByRole("log"))

		expect(line()).not.toHaveFocus()

		selected.mockRestore()
	})

	it("hands the keyboard back on a click aimed at it", async () => {
		await mount({ keyboardOnFocus: false })
		expect(line()).not.toHaveFocus()

		await userEvent.click(screen.getByRole("log"))

		expect(line()).toHaveFocus()
	})
})

describe("the state the commands attack", () => {
	it("empties the screen on `clear`, and keeps the history to walk", async () => {
		await mount()

		await type("hello")
		expect(await screen.findByText("Hello world")).toBeInTheDocument()

		await type("clear")
		await waitFor(() =>
			expect(screen.queryByText("Hello world")).not.toBeInTheDocument()
		)

		await userEvent.type(line(), "{ArrowUp}")
		expect(line()).toHaveValue("clear")
	})

	it("takes the size of the theme, and the one `font` asks for", async () => {
		const { container } = render(
			<Shell commands={baseCommands} themes={themes} animation={false} />
		)
		const box = () => container.querySelector("[data-theme]")!

		const before = getComputedStyle(box()).fontSize

		await userEvent.type(screen.getByRole("textbox"), "font +{Enter}")

		await waitFor(() =>
			expect(getComputedStyle(box()).fontSize).not.toBe(before)
		)
	})
})
