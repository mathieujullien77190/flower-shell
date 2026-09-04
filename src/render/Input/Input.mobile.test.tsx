import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ThemeProvider } from "styled-components"

import { baseCommands } from "@commands/base"
import { createInstance } from "@state/instance"
import { flowerTheme } from "@theme"
import Input from "./index"

/**
 * A phone, as `react-device-detect` reports one. It matters here alone: a
 * phone keyboard has no [TAB], so [ENTER] takes the completion instead of
 * playing the line, and the hint says so.
 */
jest.mock("react-device-detect", () => ({ isMobile: true }))

/**
 * The input paints with the theme of its terminal, read off the provider
 * that terminal puts up: on its own it needs one too.
 */
const dressed = (ui: React.ReactNode) =>
	render(<ThemeProvider theme={flowerTheme}>{ui}</ThemeProvider>)

const options = { lang: "en", animation: false, keyboardOnFocus: true }

const instance = createInstance()

const show = (onValidate = () => {}) =>
	dressed(
		<Input
			instance={instance}
			known={baseCommands}
			options={options}
			onValidate={onValidate}
		/>
	)

const line = () => screen.getByRole("textbox")

describe("on a phone", () => {
	it("names [ENTER] in the hint, where a keyboard is offered [TAB]", async () => {
		show()

		await userEvent.type(line(), "flo")

		expect(screen.getByText(/ENTER/)).toBeInTheDocument()
	})

	it("takes the completion on [ENTER] rather than playing the line", async () => {
		const onValidate = jest.fn()
		show(onValidate)

		await userEvent.type(line(), "flo{Enter}")

		expect(line()).toHaveValue("flowers ")
		expect(onValidate).not.toHaveBeenCalled()
	})

	it("plays the line once there is nothing left to complete", async () => {
		const onValidate = jest.fn()
		show(onValidate)

		await userEvent.type(line(), "flowers {Enter}")

		expect(onValidate).toHaveBeenCalledWith("flowers")
	})
})
