import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { baseCommands } from "@commands/base"
import { flowerTheme, setTheme } from "@theme"
import Input from "./index"

/**
 * A phone, as `react-device-detect` reports one. It matters here alone: a
 * phone keyboard has no [TAB], so [ENTER] takes the completion instead of
 * playing the line, and the hint says so.
 */
jest.mock("react-device-detect", () => ({ isMobile: true }))

beforeAll(() => setTheme(flowerTheme))

const options = { lang: "en", animation: false, keyboardOnFocus: true }

const show = (onValidate = () => {}) =>
	render(
		<Input known={baseCommands} options={options} onValidate={onValidate} />
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
