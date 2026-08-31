import { createContext, useContext, useEffect, useMemo, useState } from "react"

import { BaseCommands, Dictionaries } from "@types"
import { createRunners } from "@engine/send"
import type { CommandErrorListener, CommandListener } from "@engine/send"
import { setDict } from "@i18n/lang"
import { setThemes, ShellThemeInput, wearTheme } from "@theme"
import { createInstance, type ShellInstance } from "./instance"
import type { ShellData, ShellState } from "./store"

type Seen = { instance: ShellInstance; data: ShellData }

/**
 * The shell a component belongs to, and its values as they were last
 * rendered. The instance holds the truth — a command reads it outside of any
 * render — and the context carries a copy so React knows when to paint.
 */
const ShellContext = createContext<Seen | null>(null)

/** a catalogue of themes, indexed by the name the visitor types */
export type ShellThemes = Record<string, ShellThemeInput>

/**
 * The hold on one terminal: what a line goes through to reach it, and what
 * its state is read from. `useShell()` hands it to anything under the
 * provider, and `<Shell ref>` hands the same thing to whoever is outside.
 */
export type ShellHandle = {
	/** plays a command as if the visitor had typed it */
	run: (commandPattern: string) => void
	/** plays a restricted command, one the visitor cannot type */
	runRestricted: (commandPattern: string) => void
	/** the state of this shell, read fresh: history, cursor, options */
	actions: () => ShellState
}

export type ShellProviderProps = {
	/**
	 * The known commands: the ones shipped with the package, plus yours.
	 * Without it, the shell mounts bare — it shows the prompt and answers
	 * nothing.
	 */
	commands?: BaseCommands
	/**
	 * The theme it starts on, by name: a key of `themes`, the way `lang` is a
	 * key of `dict`. Without it, the first of the catalogue — and if `themes`
	 * is not given either, the shell wears nothing.
	 *
	 * A name absent from the catalogue is ignored: it cannot start on a theme
	 * the visitor would have no way of finding again.
	 *
	 * The theme is shared by every terminal on the page: two shells cannot
	 * wear two, and switching it in one repaints the other.
	 */
	theme?: string
	/**
	 * The themes the visitor can take, indexed by the name they type. These
	 * are exactly the ones `theme <name>` accepts and `help theme` lists —
	 * nothing more.
	 *
	 * For the whole catalogue of the package at once, `themes={themes}`.
	 * Without it, the visitor has no theme to take: `theme <name>` answers
	 * nothing and `help theme` lists nothing.
	 *
	 * Each one describes itself through the key `theme.<name>`: provide it in
	 * your dictionary for yours, or the key shows up as it is.
	 */
	themes?: ShellThemes
	/**
	 * Your texts, by language. They cover the ones of the package key by key,
	 * and a language the package does not have becomes reachable through
	 * `lang <code>`.
	 *
	 * The dictionaries are shared by every terminal on the page; the language
	 * each one speaks is not.
	 */
	dict?: Dictionaries
	/** starting language; without it, English */
	lang?: string
	/** letter by letter writing of the answers; true by default */
	animation?: boolean
	/** the input takes the focus back as soon as it loses it; true by default */
	keyboardOnFocus?: boolean
	/**
	 * Commands played at startup, in the order of the array. Each one goes as
	 * if typed; the restricted ones (`title`, `welcome`…) go through the
	 * restricted channel. This is where the opening goes — `["title",
	 * "welcome"]` for the logo then the greeting.
	 *
	 * Played once, on a blank screen: a `clear` does not play them again, it
	 * erases and nothing else. Bringing them back is up to the consumer —
	 * `onCommandDone` tells it about the `clear`, the handle lets it replay
	 * whatever it wants.
	 */
	initialCommands?: string[]
	/**
	 * Before the command plays. The name and the arguments are read off the
	 * line that was sent: at that point the shell does not yet know whether
	 * it has a command by that name, so this one fires for a line it will
	 * turn down afterwards too.
	 */
	onCommandStart?: CommandListener
	/**
	 * The action returned its text and the effect played. The command is
	 * over, but nothing is on screen yet: the writing takes the time of its
	 * animation. Only fires for a command that could play.
	 */
	onCommandDone?: CommandListener
	/**
	 * The command has finished being written on screen. Fires once per
	 * command, as it happens, and never for a command that could not play.
	 */
	onCommandRendered?: CommandListener
	/**
	 * The command did not play. `reason` says why: `unknown` when no command
	 * carries that name, `args` when it exists but its arguments do not pass,
	 * `thrown` when its action or its effect threw — and the error is then in
	 * `error`.
	 *
	 * A shell with an empty registry has nothing to object to: it lets
	 * through whatever is typed, and so reports no error.
	 */
	onCommandError?: CommandErrorListener
	children: React.ReactNode
}

/**
 * What a terminal is, and who it answers to. Everything the shell is made of
 * is set here; `<Shell>` under it only draws.
 *
 * It is what lets a neighbour of the terminal reach it: a button beside the
 * screen takes `useShell()` and plays a line, with no ref to carry around.
 * Several providers on a page are several terminals, each with its own
 * history, its own cursor and its own language.
 */
export const ShellProvider = ({
	commands = {},
	theme,
	themes,
	dict,
	lang,
	animation,
	keyboardOnFocus,
	initialCommands = [],
	onCommandStart,
	onCommandDone,
	onCommandRendered,
	onCommandError,
	children,
}: ShellProviderProps) => {
	/**
	 * This shell, and nothing of anyone else's: its values, its commands, its
	 * listeners. Built before the first render, because the terminal reads
	 * them as it renders.
	 */
	const [instance] = useState(() => {
		const created = createInstance({ lang, animation, keyboardOnFocus })

		// the dictionary first: a command played translates as it executes
		setDict(dict)
		created.setCommands(commands)
		// the catalogue before the starting theme: `help theme` and `theme
		// <name>` read the first, and the second need not be part of it
		setThemes(themes)
		wearTheme(theme)
		return created
	})

	const [data, setData] = useState(instance.data)

	// hooked up before the first render: the opening plays on mount, and its
	// lines would otherwise be written with nobody listening
	useState(() => {
		instance.onChange(setData)
		return true
	})

	useEffect(() => {
		setDict(dict)
	}, [dict])

	useEffect(() => {
		instance.setCommands(commands)
	}, [instance, commands])

	useEffect(() => {
		setThemes(themes)
		wearTheme(theme)
	}, [themes, theme])

	// the listeners belong to this shell: two terminals warn two consumers
	useEffect(() => {
		instance.setListeners({
			start: onCommandStart,
			done: onCommandDone,
			rendered: onCommandRendered,
			error: onCommandError,
		})
	}, [
		instance,
		onCommandStart,
		onCommandDone,
		onCommandRendered,
		onCommandError,
	])

	// after the mount, never during the render: the language of the browser
	// does not exist at prerender, and applying it earlier would make the HTML
	// diverge
	useEffect(() => {
		if (lang) instance.actions.setLang(lang)
	}, [instance, lang])

	useEffect(() => {
		if (animation !== undefined) instance.actions.setAnimation(animation)
	}, [instance, animation])

	useEffect(() => {
		if (keyboardOnFocus !== undefined)
			instance.actions.setKeyboardOnFocus(keyboardOnFocus)
	}, [instance, keyboardOnFocus])

	/**
	 * The opening plays on mount, but only if the screen is empty. The
	 * provider can be unmounted then mounted again — a page one leaves and
	 * comes back to — and it may come back to an instance that has already
	 * played: playing the opening again would show the title twice.
	 */
	useEffect(() => {
		const { commands: played, restrictedCommands } = instance.data()
		const onScreen = [...played, ...restrictedCommands].some(
			command => command.visible
		)

		if (onScreen) return

		const { run, runRestricted } = createRunners(instance)

		// the starting commands, one after the other in the order of the
		// array. a restricted one (title…) goes through the restricted
		// channel, the others as if typed
		initialCommands.forEach(pattern => {
			const name = pattern.split(" ")[0]
			if (instance.commands()[name]?.restricted) runRestricted(pattern)
			else run(pattern)
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [instance])

	const seen = useMemo(() => ({ instance, data }), [instance, data])

	return <ShellContext.Provider value={seen}>{children}</ShellContext.Provider>
}

const useSeen = (): Seen => {
	const seen = useContext(ShellContext)

	if (!seen) {
		throw new Error("This hook only reads inside a <ShellProvider>.")
	}

	return seen
}

/** the provider above, or null when there is none — `Shell` makes its own */
export const useMaybeShellContext = () => useContext(ShellContext)

const useData = (): ShellData => useSeen().data

/**
 * The terminal this component sits under: `run` and `runRestricted` play a
 * line into it, `actions()` reads its state. A button beside the screen needs
 * nothing else.
 */
export const useShell = (): ShellHandle => {
	const { instance } = useSeen()

	return useMemo(
		() => ({
			...createRunners(instance),
			actions: () => ({ ...instance.data(), ...instance.actions }),
		}),
		[instance]
	)
}

/** the commands this shell knows, read at render */
export const useCommands = (): BaseCommands => useSeen().instance.commands()

/** the instance itself, for what has to write into it */
export const useInstance = (): ShellInstance => useSeen().instance

/**
 * The two lists put back in the order they arrived in. The sort goes by
 * `order` and not by `timestamp`: the commands of the opening leave in the
 * same loop and land on the same millisecond, and the sort, being stable,
 * then returned the order of the two lists rather than the one of the
 * typing.
 */
export const useGetCommands = () => {
	const { commands, restrictedCommands } = useData()

	return useMemo(
		() =>
			[
				...commands.filter(command => command.visible),
				...restrictedCommands.filter(command => command.visible),
			].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
		[commands, restrictedCommands]
	)
}

export const useGetCursor = () => useData().cursor

export const useGetCurrentCommand = () => {
	const { cursor, commands } = useData()

	return cursor === null ? null : commands[cursor] || null
}

/**
 * The startup is over: not one restricted command left waiting to be
 * rendered, and the visitor has not typed anything yet. It is what
 * `initialCommands` plays that fills the first condition, whatever its
 * length.
 */
export const useGetStart = () => {
	const { commands, restrictedCommands } = useData()

	return (
		restrictedCommands.every(command => command.isRendered) &&
		commands.length === 0
	)
}

/** last command played by the visitor, the restricted ones left out */
export const useGetLastCommand = () => {
	const { commands } = useData()

	return commands[commands.length - 1] || null
}

export const useLang = () => useData().lang

export const useAnimation = () => useData().animation

export const useThemeName = () => useData().themeName

export const useKeyboardOnFocus = () => useData().keyboardOnFocus
