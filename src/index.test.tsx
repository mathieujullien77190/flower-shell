import { render } from "@testing-library/react"

import {
	BASE_LANG,
	Shell,
	ShellProvider,
	autocompleteCommand,
	bareTheme,
	baseCommands,
	contrastTheme,
	flowerTheme,
	hibiscusTheme,
	kiwiTheme,
	lavenderTheme,
	mapleTheme,
	nestTheme,
	riceTheme,
	browserLang,
	createCommand,
	defaultTheme,
	dictEn,
	dictFr,
	executeCommand,
	findCommand,
	highlight,
	highlightFlower,
	langs,
	plantFlowers,
	readHelp,
	setDict,
	setTheme,
	setThemes,
	t,
	test,
	theme,
	themeByName,
	themeNames,
	themeTone,
	themes,
	title,
	useShell,
	wearTheme,
} from "./index"

/**
 * The public surface of the package, played through the entry file and not
 * through the modules underneath: an export that stops resolving, or stops
 * doing what its name says, shows here and not in a consumer's project.
 */
describe("what the package hands out", () => {
	it("mounts a shell", () => {
		const { container } = render(<Shell commands={baseCommands} />)

		expect(container.querySelector("input")).toBeInTheDocument()
	})

	it("carries the commands of the package, and the workbench beside them", () => {
		expect(Object.keys(baseCommands)).toContain("help")
		expect(test.restricted).toBe(false)
		expect(title).toContain("'---'")
	})

	it("draws its two ascii pieces", () => {
		expect(plantFlowers().split("\n")).toHaveLength(9)
		expect(
			render(<div>{highlightFlower("IlitI", {})}</div>).container.textContent
		).toBe("lit")
	})

	it("colors the markup", () => {
		const painted = render(<div>{highlight("+info+", () => {})}</div>)

		expect(painted.container.textContent).toBe("info")
	})

	it("speaks, and says which languages it speaks", () => {
		setDict({ en: dictEn, fr: dictFr })

		expect(BASE_LANG).toBe("en")
		expect(langs()).toEqual(["en", "fr"])
		expect(t("hello.world")).toBe("Hello world")
		expect(typeof browserLang()).toBe("string")

		setDict()
	})

	it("hands each theme of the catalogue under its own name", () => {
		expect(themes).toEqual({
			flower: flowerTheme,
			hibiscus: hibiscusTheme,
			kiwi: kiwiTheme,
			contrast: contrastTheme,
			maple: mapleTheme,
			lavender: lavenderTheme,
			rice: riceTheme,
			nest: nestTheme,
		})
	})

	it("hands its themes, and the tone they are read in", () => {
		setThemes(themes)
		wearTheme("kiwi")

		expect(Object.keys(themes)).toHaveLength(8)
		expect(themeNames()).toEqual(Object.keys(themes))
		expect(themeByName("kiwi")).toEqual(themes.kiwi)
		expect(themeTone(themes.kiwi)).toBe("dark")
		expect(theme().prompt).toBe(themes.kiwi.prompt)
		expect(bareTheme.colors.background).toBe("transparent")
		expect(defaultTheme).toBe(themes.flower)

		setTheme({ prompt: "$" })
		expect(theme().prompt).toBe("$")

		wearTheme("flower")
	})

	it("reads and runs a command line", () => {
		const command = createCommand({
			commands: baseCommands,
			commandPattern: "hello you",
			restricted: false,
		})

		expect(command.name).toBe("hello")
		expect(command.args).toEqual(["you"])
		expect(
			executeCommand({
				commands: baseCommands,
				name: command.name,
				command: baseCommands.hello!,
				args: command.args,
			})
		).toBe("Hello you")

		expect(
			findCommand({ commands: baseCommands, name: "hello", restricted: false })
		).toBe(baseCommands.hello)
		expect(readHelp(baseCommands.help!)!.description).toBe("help.desc")
		expect(
			autocompleteCommand({ commands: baseCommands, startCommand: "flo" })
		).toBe("flowers")
	})

	it("hands a way to command a named terminal", () => {
		let reached = false

		const Hand = () => {
			reached = typeof useShell().run === "function"
			return null
		}

		render(
			<ShellProvider>
				<Hand />
			</ShellProvider>
		)

		expect(reached).toBe(true)
	})
})
