import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "styled-components"

import { baseCommands } from "@commands/base"
import { createInstance } from "@state/instance"
import { flowerTheme } from "@theme"
import Input from "./index"

/**
 * The input paints with the theme of its terminal, read off the provider
 * that terminal puts up: on its own it needs one too.
 */
const dressed = (ui: React.ReactNode) =>
	render(<ThemeProvider theme={flowerTheme}>{ui}</ThemeProvider>)

const options = { lang: "en", animation: false, keyboardOnFocus: true }

// the shell it types into: it answers the label and the hint of the input
const instance = createInstance()

const show = (over: Partial<React.ComponentProps<typeof Input>> = {}) =>
	dressed(
		<Input
			instance={instance}
			known={baseCommands}
			options={options}
			onValidate={() => {}}
			{...over}
		/>
	)

const line = () => screen.getByRole("textbox")

describe("what is typed", () => {
	it("hands the line over on [ENTER], and empties itself", async () => {
		const onValidate = jest.fn()
		show({ onValidate })

		await userEvent.type(line(), "hello you{Enter}")

		expect(onValidate).toHaveBeenCalledWith("hello you")
		expect(line()).toHaveValue("")
	})

	it("hands nothing over on an empty line", async () => {
		const onValidate = jest.fn()
		show({ onValidate })

		await userEvent.type(line(), "{Enter}")

		expect(onValidate).not.toHaveBeenCalled()
	})

	it("plays a line with nobody listening: the callbacks are all optional", async () => {
		dressed(
			<Input instance={instance} known={baseCommands} options={options} />
		)

		await userEvent.type(line(), "hello{Enter}{ArrowUp}{ArrowDown}")

		expect(line()).toHaveValue("")
	})

	it("takes the value the history pushes into it", () => {
		const { rerender } = show({ value: "" })

		rerender(
			<ThemeProvider theme={flowerTheme}>
				<Input
					instance={instance}
					known={baseCommands}
					options={options}
					onValidate={() => {}}
					value="flowers"
				/>
			</ThemeProvider>
		)

		expect(line()).toHaveValue("flowers")
	})
})

describe("the completion", () => {
	it("shows what [TAB] would put there", async () => {
		show()

		await userEvent.type(line(), "flo")

		expect(screen.getByText(/flowers/)).toBeInTheDocument()
	})

	it("shows nothing when no command starts that way", async () => {
		show()

		await userEvent.type(line(), "zzz")

		expect(screen.queryByText(/press/)).toBeNull()
	})

	it("takes it on [TAB], and leaves a space to type the arguments", async () => {
		show()

		await userEvent.type(line(), "flo")
		await userEvent.type(line(), "{Tab}")

		expect(line()).toHaveValue("flowers ")
	})

	it("ties the hint to the field, so it is read after it", async () => {
		show()

		await userEvent.type(line(), "flo")

		expect(line()).toHaveAttribute("aria-describedby")
	})

	it("speaks the language of its shell", async () => {
		show({ options: { ...options, lang: "fr" } })

		await userEvent.type(line(), "flo")

		expect(screen.getByText(/appuyez|press/)).toBeInTheDocument()
	})
})

describe("the history", () => {
	it("asks for the line before on the up arrow", async () => {
		const onCallPrevious = jest.fn()
		show({ onCallPrevious })

		await userEvent.type(line(), "{ArrowUp}")

		expect(onCallPrevious).toHaveBeenCalled()
	})

	it("asks for the line after on the down arrow", async () => {
		const onCallNext = jest.fn()
		show({ onCallNext })

		await userEvent.type(line(), "{ArrowDown}")

		expect(onCallNext).toHaveBeenCalled()
	})
})

describe("the focus", () => {
	it("takes it at mount when the shell keeps the keyboard", () => {
		show()

		expect(line()).toHaveFocus()
	})

	it("leaves it alone otherwise", () => {
		show({ options: { ...options, keyboardOnFocus: false } })

		expect(line()).not.toHaveFocus()
	})

	it("does nothing on a release when it already has the keyboard", async () => {
		show()
		expect(line()).toHaveFocus()

		await userEvent.click(line())

		expect(line()).toHaveFocus()
	})

	it("leaves a selection alone: taking the focus back would wipe it", async () => {
		show()
		const selected = jest
			.spyOn(window, "getSelection")
			.mockReturnValue({ toString: () => "picked" } as Selection)

		const outside = document.createElement("button")
		document.body.appendChild(outside)
		outside.focus()
		await userEvent.click(outside)

		expect(line()).not.toHaveFocus()

		selected.mockRestore()
		outside.remove()
	})

	it("takes it back when a click elsewhere is released", async () => {
		show()
		const outside = document.createElement("button")
		document.body.appendChild(outside)

		outside.focus()
		expect(line()).not.toHaveFocus()

		await userEvent.click(outside)

		expect(line()).toHaveFocus()
		outside.remove()
	})

	it("leaves it alone on a release when the shell gave the keyboard up", async () => {
		show({ options: { ...options, keyboardOnFocus: false } })
		const outside = document.createElement("button")
		document.body.appendChild(outside)

		outside.focus()
		await userEvent.click(outside)

		expect(line()).not.toHaveFocus()
		outside.remove()
	})

	it("takes it on a click aimed at the terminal, option or no option", () => {
		const { rerender } = show({
			options: { ...options, keyboardOnFocus: false },
			forceFocus: 0,
		})

		expect(line()).not.toHaveFocus()

		rerender(
			<ThemeProvider theme={flowerTheme}>
				<Input
					instance={instance}
					known={baseCommands}
					options={{ ...options, keyboardOnFocus: false }}
					onValidate={() => {}}
					forceFocus={1}
				/>
			</ThemeProvider>
		)

		expect(line()).toHaveFocus()
	})
})
