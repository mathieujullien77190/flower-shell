import {
	Ref,
	RefObject,
	useCallback,
	useEffect,
	useImperativeHandle,
	useState,
} from "react"

import Terminal from "./render/Terminal"

import { createRunners } from "./engine/send"
import type { CommandErrorListener, CommandListener } from "./engine/send"
import { setDict } from "./i18n/lang"
import { createInstance } from "./state/instance"
import {
	ShellProvider,
	useAnimation,
	useGetCommands,
	useGetCurrentCommand,
	useKeyboardOnFocus,
	useLang,
} from "./state/context"
import type { ShellState } from "./state/store"
import { setThemes, ShellThemeInput, wearTheme } from "./theme"
import { BaseCommands, Dictionaries } from "./types"

/** a catalogue of themes, indexed by the name the visitor types */
export type ShellThemes = Record<string, ShellThemeInput>

/**
 * The hold on one terminal, handed through `ref`. It is how a line reaches a
 * shell from outside React — a button of yours, a game that ends — and, with
 * several terminals on the page, the only thing that says which one.
 */
export type ShellHandle = {
	/** plays a command as if the visitor had typed it */
	run: (commandPattern: string) => void
	/** plays a restricted command, one the visitor cannot type */
	runRestricted: (commandPattern: string) => void
	/** the state of this shell, read fresh: history, cursor, options */
	actions: () => ShellState
}

export type ShellProps = {
	ref?: Ref<ShellHandle>
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
	 * Element to scroll as the output grows: the box holding the shell, when
	 * it has a scroll of its own. Without it, nothing scrolls on its own and
	 * a long output goes past whatever holds the shell.
	 */
	scrollRef?: RefObject<HTMLElement | null>
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
}

/**
 * The terminal: the list of the commands played and the input line.
 *
 * It takes the room it is given and nothing more — the height, the frame,
 * the place on the page belong to whoever displays it.
 *
 * Each one owns its history, its cursor and its options, so several can live
 * on the same page. The theme and the dictionaries stay shared: the markup
 * is coloured by a function, not by a component, and a provider would not
 * reach it.
 */
export const Shell = ({
	ref,
	commands = {},
	theme,
	themes,
	dict,
	lang,
	animation,
	keyboardOnFocus,
	initialCommands = [],
	scrollRef,
	onCommandStart,
	onCommandDone,
	onCommandRendered,
	onCommandError,
}: ShellProps) => {
	/**
	 * This shell, and nothing of anyone else's: its store, its commands, its
	 * listeners. Built before the first render, because the terminal reads
	 * the registry as it renders.
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

	const [runners] = useState(() => createRunners(instance))

	useImperativeHandle(
		ref,
		() => ({ ...runners, actions: () => instance.store.getState() }),
		[instance, runners]
	)

	return (
		<ShellProvider value={instance}>
			<Screen
				commands={commands}
				theme={theme}
				themes={themes}
				dict={dict}
				lang={lang}
				animation={animation}
				keyboardOnFocus={keyboardOnFocus}
				initialCommands={initialCommands}
				scrollRef={scrollRef}
				onCommandStart={onCommandStart}
				onCommandDone={onCommandDone}
				onCommandRendered={onCommandRendered}
				onCommandError={onCommandError}
				instance={instance}
				runners={runners}
			/>
		</ShellProvider>
	)
}

type ScreenProps = Omit<ShellProps, "ref"> & {
	instance: ReturnType<typeof createInstance>
	runners: ReturnType<typeof createRunners>
}

/**
 * The terminal itself, inside the provider: the hooks below read the store
 * of the instance above, which is why this is a component of its own.
 */
const Screen = ({
	commands = {},
	theme,
	themes,
	dict,
	lang,
	animation,
	keyboardOnFocus,
	initialCommands = [],
	scrollRef,
	onCommandStart,
	onCommandDone,
	onCommandRendered,
	onCommandError,
	instance,
	runners,
}: ScreenProps) => {
	const { run, runRestricted } = runners

	const history = useGetCommands()
	const currentCommand = useGetCurrentCommand()

	const options = {
		lang: useLang(),
		animation: useAnimation(),
		keyboardOnFocus: useKeyboardOnFocus(),
	}

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
			error: onCommandError,
		})
	}, [instance, onCommandStart, onCommandDone, onCommandError])

	// after the mount, never during the render: the language of the browser
	// does not exist at prerender, and applying it earlier would make the HTML
	// diverge
	useEffect(() => {
		if (lang) instance.store.getState().setLang(lang)
	}, [instance, lang])

	useEffect(() => {
		if (animation !== undefined)
			instance.store.getState().setAnimation(animation)
	}, [instance, animation])

	useEffect(() => {
		if (keyboardOnFocus !== undefined)
			instance.store.getState().setKeyboardOnFocus(keyboardOnFocus)
	}, [instance, keyboardOnFocus])

	/**
	 * The opening plays on mount, but only if the screen is empty. The shell
	 * can be unmounted then mounted again — a page one leaves and comes back
	 * to — and a story or a route may hand it a store that has already
	 * played: playing it again would show the title twice.
	 */
	useEffect(() => {
		const { commands: played, restrictedCommands } = instance.store.getState()
		const onScreen = [...played, ...restrictedCommands].some(
			command => command.visible
		)

		if (!onScreen) {
			// the starting commands, one after the other in the order of the
			// array. a restricted one (title…) goes through the restricted
			// channel, the others as if typed
			initialCommands.forEach(pattern => {
				const name = pattern.split(" ")[0]
				if (instance.commands()[name]?.restricted) runRestricted(pattern)
				else run(pattern)
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [instance])

	const scrollDown = useCallback(() => {
		scrollRef?.current?.scrollTo(0, 1000000)
	}, [scrollRef])

	/**
	 * The end of the writing is reported on every render for as long as the
	 * command is on screen, not only as it happens: so the event fires on the
	 * flip alone, when the command was not marked rendered yet. Without that
	 * guard, `onCommandRendered` would fire again on every render of the
	 * terminal.
	 */
	const handleRendered = useCallback(
		(id: string) => {
			const actions = instance.store.getState()
			const done = [...actions.commands, ...actions.restrictedCommands].find(
				command => command.id === id
			)
			const first = !!done && !done.isRendered

			actions.setIsRendered(id)
			scrollDown()

			if (first && done.canExecute) {
				onCommandRendered?.({
					name: done.name,
					args: done.args,
					pattern: done.pattern,
				})
			}
		},
		[instance, scrollDown, onCommandRendered]
	)

	const moveCursor = useCallback(
		(direction: number) => {
			instance.store.getState().moveCursor(direction)
		},
		[instance]
	)

	return (
		<Terminal
			options={options}
			commands={history}
			currentCommand={currentCommand}
			onSendCommand={run}
			onSendRestrictedCommand={runRestricted}
			onAnimateCommand={scrollDown}
			onSendPreviousCommand={() => moveCursor(-1)}
			onSendNextCommand={() => moveCursor(1)}
			onRendered={handleRendered}
		/>
	)
}
