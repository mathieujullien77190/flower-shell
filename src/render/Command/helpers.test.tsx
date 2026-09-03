import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { flowerTheme, setTheme } from "@theme"
import { highlight } from "./helpers"

// the markup reads the theme at render: this one paints, where `bareTheme`
// would answer `inherit` everywhere
beforeAll(() => setTheme(flowerTheme))

const show = (text: string, onClick = () => {}) =>
	render(<div data-testid="line">{highlight(text, onClick)}</div>)

const line = () => screen.getByTestId("line")

describe("highlight", () => {
	it("leaves an unmarked text alone", () => {
		show("nothing to color here")

		expect(line()).toHaveTextContent("nothing to color here")
		expect(line().querySelectorAll("span")).toHaveLength(0)
	})

	it("colors an inline marker and drops the marks", () => {
		show("this is +important+ here")

		expect(line()).toHaveTextContent("this is important here")

		const span = line().querySelector("span")!
		expect(span).toHaveTextContent("important")
		expect(span.style.color).not.toBe("")
		expect(span.style.background).toBe("")
	})

	it("colors each marker with its own color", () => {
		show("+info+ and `cmd`")

		const spans = line().querySelectorAll("span")
		expect(spans).toHaveLength(2)
		expect(spans[0].style.color).not.toBe(spans[1].style.color)
	})

	it("paints a tag on its background", () => {
		show("[+tag+] here")

		const span = line().querySelector("span")!
		expect(span).toHaveTextContent("tag")
		expect(span.style.background).not.toBe("")
		expect(span.style.fontWeight).toBe("bold")
		// the brackets are the mark of the tag: they do not show
		expect(line()).toHaveTextContent("tag here")
	})

	it("reads white or black on the background of a tag", () => {
		show("[+light+]")

		const span = line().querySelector("span")!
		// a light background of the theme calls for black text
		expect(["rgb(27, 27, 27)", "rgb(255, 255, 255)"]).toContain(
			span.style.color
		)
	})

	it("takes the tag before the inline pass", () => {
		show("[`clear`]")

		expect(line().querySelectorAll("span")).toHaveLength(1)
		expect(line()).toHaveTextContent("clear")
	})

	it("shows an escaped marker as it is, with no color", () => {
		show("a \\+ sign, and \\+another\\+")

		expect(line()).toHaveTextContent("a + sign, and +another+")
		expect(line().querySelectorAll("span")).toHaveLength(0)
	})

	it("leaves a lone backslash on screen", () => {
		show("a \\ backslash")

		expect(line()).toHaveTextContent("a \\ backslash")
	})

	it("underlines a clickable marker", () => {
		show("#go to help ~ help#")

		const span = line().querySelector("span")!
		expect(span).toHaveTextContent("go to help")
		expect(span.style.textDecoration).toBe("underline")
		expect(span.style.cursor).toBe("pointer")
	})

	it("plays the actionmap command on a click, arguments and all", async () => {
		const onClick = jest.fn()
		show("#the lavender theme ~ theme lavender#", onClick)

		await userEvent.click(screen.getByText("the lavender theme"))

		expect(onClick).toHaveBeenCalledWith("actionmap", ["theme", "lavender"])
	})

	it("puts a clickable marker in the tab order, as a button", () => {
		show("#go to help ~ help#")

		const marker = screen.getByRole("button", { name: "go to help" })
		expect(marker).toHaveAttribute("tabindex", "0")
	})

	it("plays a clickable marker on [ENTER] and on [SPACE]", async () => {
		const onClick = jest.fn()
		show("#the lavender theme ~ theme lavender#", onClick)

		screen.getByRole("button").focus()
		await userEvent.keyboard("{Enter}")
		await userEvent.keyboard(" ")

		expect(onClick).toHaveBeenCalledTimes(2)
		expect(onClick).toHaveBeenCalledWith("actionmap", ["theme", "lavender"])
	})

	it("leaves a marker that plays nothing out of the tab order", () => {
		show("+info+")

		expect(screen.queryByRole("button")).not.toBeInTheDocument()
	})

	it("trims the label of what surrounds the tilde", () => {
		show("#label ~ help#")

		expect(screen.getByText("label")).toBeInTheDocument()
	})

	it("clicks nothing on a marker that is not clickable", async () => {
		const onClick = jest.fn()
		show("+info+", onClick)

		await userEvent.click(screen.getByText("info"))

		expect(onClick).not.toHaveBeenCalled()
	})

	it("hides a text behind the background", () => {
		show("_hidden_")

		const span = line().querySelector("span")!
		expect(span).toHaveTextContent("hidden")
		expect(span.style.color).not.toBe("")
	})
})
