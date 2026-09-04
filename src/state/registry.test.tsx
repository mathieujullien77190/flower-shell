import { useEffect } from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { Shell } from "../Shell"
import { baseCommands } from "../commands/base"
import { themes } from "../theme"
import { ShellProvider, useShell, type ShellControls } from "./registry"

/**
 * A hand on the registry, kept outside React: the toolbar of a consumer,
 * reduced to what a test needs to press. It is published from an effect and
 * not during the render — assigning to the outside from a component body is
 * exactly what the rules of hooks forbid.
 */
let hand: ShellControls

const take = (controls: ShellControls) => {
	hand = controls
}

const Hand = () => {
	const shell = useShell()

	useEffect(() => take(shell), [shell])

	return null
}

const mount = async (children: React.ReactNode) =>
	act(async () => {
		render(
			<ShellProvider>
				<Hand />
				{children}
			</ShellProvider>
		)
	})

const shell = (id?: string) => (
	<Shell
		id={id}
		commands={baseCommands}
		themes={themes}
		theme="flower"
		animation={false}
	/>
)

describe("useShell", () => {
	it("refuses outside of a provider", () => {
		const Alone = () => {
			useShell()
			return null
		}

		// the error is the point; React prints it too, and that is noise
		const quiet = jest.spyOn(console, "error").mockImplementation(() => {})

		expect(() => render(<Alone />)).toThrow(
			"useShell() only reads inside a <ShellProvider>"
		)

		quiet.mockRestore()
	})

	it("plays a line into the terminal it names", async () => {
		await mount(shell("left"))

		await act(async () => hand.run("left", "hello you"))

		expect(await screen.findByText("Hello you")).toBeInTheDocument()
	})

	it("plays a line the visitor cannot type", async () => {
		await mount(shell("left"))

		await act(async () => hand.runRestricted("left", "welcome"))

		expect(await screen.findByText(/Welcome to/)).toBeInTheDocument()
		// restricted: the line that played it is not shown
		expect(screen.queryByText("welcome", { exact: true })).toBeNull()
	})

	it("hands the state of that terminal, read fresh", async () => {
		await mount(shell("left"))

		expect(hand.actions("left").lang).toBe("en")
		expect(hand.actions("left").commands).toHaveLength(0)

		await act(async () => hand.run("left", "hello"))

		expect(hand.actions("left").commands).toHaveLength(1)
	})

	it("hands the setters with the values", async () => {
		await mount(shell("left"))

		await act(async () => hand.actions("left").setLang("fr"))

		expect(hand.actions("left").lang).toBe("fr")
	})

	it("keeps two terminals apart", async () => {
		await mount(
			<>
				{shell("left")}
				{shell("right")}
			</>
		)

		await act(async () => hand.run("left", "hello left"))

		expect(await screen.findByText("Hello left")).toBeInTheDocument()
		expect(hand.actions("left").commands).toHaveLength(1)
		expect(hand.actions("right").commands).toHaveLength(0)
	})

	it("says which terminals are mounted when the id is not one of them", async () => {
		await mount(shell("left"))

		expect(() => hand.run("nowhere", "hello")).toThrow(
			'No shell is mounted under the id "nowhere"'
		)
		expect(() => hand.run("nowhere", "hello")).toThrow(
			'Mounted right now: "left"'
		)
	})

	it("says that none is mounted when a shell was given no id", async () => {
		await mount(shell())

		expect(() => hand.run("left", "hello")).toThrow(
			"a shell only enters the registry if it was given an `id`"
		)
	})

	it("signs a terminal out when it leaves", async () => {
		const { unmount } = render(
			<ShellProvider>
				<Hand />
				{shell("left")}
			</ShellProvider>
		)

		await waitFor(() => expect(hand.actions("left")).toBeDefined())

		unmount()

		expect(() => hand.actions("left")).toThrow("No shell is mounted")
	})

	it("leaves the id to whoever took it over", async () => {
		// two terminals named the same, under one provider: the last one
		// mounted holds the id, and the other one leaving must not clear it
		const both = render(
			<ShellProvider>
				<Hand />
				{shell("twice")}
				{shell("twice")}
			</ShellProvider>
		)

		await act(async () => hand.run("twice", "hello"))

		// one of the two answered, not both
		expect(await screen.findAllByText("Hello world")).toHaveLength(1)

		both.unmount()

		expect(() => hand.actions("twice")).toThrow("No shell is mounted")
	})

	it("reaches a terminal mounted after the hand that commands it", async () => {
		// the id is read when the method is called, not when the hook runs
		await mount(shell("left"))

		await userEvent.type(screen.getByRole("textbox"), "hello{Enter}")
		await act(async () => hand.run("left", "hello again"))

		expect(await screen.findByText("Hello again")).toBeInTheDocument()
	})
})
