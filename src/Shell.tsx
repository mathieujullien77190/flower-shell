import { RefObject, useCallback, useEffect, useRef, useState } from "react"

import Terminal from "./render/Terminal"
import Window from "./window"
import type { WindowStart } from "./window/types"

import { run, runRestricted, setListeners } from "./engine/send"
import type { CommandErrorListener, CommandListener } from "./engine/send"
import { setDict } from "./i18n/lang"
import { getCommands, setCommands } from "./state/registry"
import {
	shellActions,
	useAnimation,
	useGetCommands,
	useGetCurrentCommand,
	useKeyboardOnFocus,
	useLang,
} from "./state/store"
import { setThemes, ShellThemeInput, wearTheme } from "./theme"
import { BaseCommand, BaseCommands, Dictionaries } from "./types"

/**
 * What it takes to put the shell in a window without assembling one
 * yourself. The object being there is enough: the shell then renders inside
 * a `Window`, whose dragging is bounded by the container the shell puts
 * around it.
 *
 * For a frame holding something other than the shell, or living on a desktop
 * of several windows, use `Window` directly.
 */
export type ShellWindowProps = {
	/** the text of the title bar */
	title?: string
	/** it is dragged by its bar; true by default */
	move?: boolean
	/** the corner it opens on; `center-center` by default */
	start?: WindowStart
	/**
	 * The distance to the edge, in CSS: `"24px"`, `"2rem"`, `"3%"`. It moves
	 * the window away from the edge `start` brings it to, and so does not
	 * apply to centered axes. Zero by default.
	 */
	margin?: string
	/**
	 * Full and not resizable: it takes the whole container, and `start` and
	 * `margin` then have nothing left to place. The margin goes on whatever
	 * holds it.
	 */
	compact?: boolean
	/** the expand button, and the double click on the bar */
	canExpand?: boolean
	/** the close cross */
	canClose?: boolean
	/**
	 * Open or closed. Without it, the window holds its own state: open on
	 * mount, the cross closes it, and nothing reopens it.
	 *
	 * Given, the caller decides, and the window only does what it is told —
	 * the cross closes nothing any more, it warns through `onClose` and waits
	 * for the prop to turn false. That is what a button reopening the
	 * terminal needs: the same state opens and closes.
	 *
	 * Closed, the terminal is unmounted, but the history lives at module
	 * level: reopened, the window finds back what was written in it, and the
	 * opening is not played again.
	 */
	open?: boolean
	/**
	 * The cross was clicked. With `open`, that is all that happens: it is up
	 * to the caller to turn the prop false if it wants to see the window go.
	 */
	onClose?: () => void
}

/** a catalogue of themes, indexed by the name the visitor types */
export type ShellThemes = Record<string, ShellThemeInput>

export type ShellProps = {
	/**
	 * The known commands: the ones shipped with the package, plus yours.
	 * Without it, the shell mounts bare — it shows the prompt and answers
	 * nothing.
	 */
	commands?: BaseCommands & { [name: string]: BaseCommand }
	/**
	 * The theme it starts on, by name: a key of `themes`, the way `lang` is a
	 * key of `dict`. Without it, the first of the catalogue — and if `themes`
	 * is not given either, the shell wears nothing.
	 *
	 * A name absent from the catalogue is ignored: it cannot start on a theme
	 * the visitor would have no way of finding again.
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
	 */
	dict?: Dictionaries
	/** starting language; without it, English */
	lang?: string
	/**
	 * Commands played at startup, in the order of the array. Each one goes as
	 * if typed; the restricted ones (`title`, `welcome`…) go through the
	 * restricted channel. This is where the opening goes — `["title",
	 * "welcome"]` for the logo then the greeting.
	 *
	 * Played once, on a blank screen: a `clear` does not play them again, it
	 * erases and nothing else. Bringing them back is up to the consumer —
	 * `onCommandDone` tells it about the `clear`, `runRestricted` lets it
	 * replay whatever it wants.
	 */
	initialCommands?: string[]
	/**
	 * Puts the shell in a window. Without it, it renders bare and fills
	 * whatever holds it.
	 *
	 * The shell then provides the container bounding the dragging, and is
	 * scrolled by the content of the frame: `scrollRef` has nothing left to
	 * say and is ignored.
	 */
	window?: ShellWindowProps
	/**
	 * Element to scroll as the output grows: the box holding the shell, when
	 * it has a scroll of its own. With `window`, the frame takes care of it
	 * and this prop is ignored.
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
 * The registry, the theme and the state live at module level — they serve
 * outside React too, a window being closed can play a command. Corollary,
 * knowingly: one shell per page.
 */
export const Shell = ({
	commands = {},
	theme,
	themes,
	dict,
	lang,
	initialCommands = [],
	// `window` is also the name of the global object: renamed here so the
	// body of the component keeps access to both
	window: frame,
	scrollRef,
	onCommandStart,
	onCommandDone,
	onCommandRendered,
	onCommandError,
}: ShellProps) => {
	/**
	 * The frame, when the `window` prop is given. `area` bounds the dragging
	 * of the window, `content` is what scrolls — it is the ref `Window`
	 * exposes, and it then replaces `scrollRef`.
	 */
	const area = useRef<HTMLDivElement>(null)
	const content = useRef<HTMLDivElement>(null)
	const [framed, setFramed] = useState(true)

	/**
	 * Who holds the opening. `open` given, it is the caller: the window
	 * follows its prop and the cross only warns. Otherwise the shell holds it
	 * for itself, as before.
	 */
	const ownFrame = frame?.open === undefined
	const shown = frame?.open ?? framed
	// set before the first render: the terminal reads the registry as it renders
	const [ready] = useState(() => {
		// the dictionary first: a command played translates as it executes
		setDict(dict)
		setCommands(commands)
		// the catalogue before the starting theme: `help theme` and `theme
		// <name>` read the first, and the second need not be part of it
		setThemes(themes)
		wearTheme(theme)
		return true
	})

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
		setCommands(commands)
	}, [commands])

	useEffect(() => {
		setThemes(themes)
		wearTheme(theme)
	}, [themes, theme])

	useEffect(() => {
		setListeners({
			start: onCommandStart,
			done: onCommandDone,
			error: onCommandError,
		})
	}, [onCommandStart, onCommandDone, onCommandError])

	// after the mount, never during the render: the language of the browser
	// does not exist at prerender, and applying it earlier would make the HTML
	// diverge
	useEffect(() => {
		if (lang) shellActions().setLang(lang)
	}, [lang])

	/**
	 * The opening plays on mount, but only if the screen is empty. The shell
	 * can be unmounted then mounted again — a window one closes and reopens —
	 * while the history lives at module level and has survived: playing it
	 * again would show the title twice.
	 */
	useEffect(() => {
		if (!ready) return

		const { commands: played, restrictedCommands } = shellActions()
		const onScreen = [...played, ...restrictedCommands].some(
			command => command.visible
		)

		if (!onScreen) {
			// the starting commands, one after the other in the order of the
			// array. a restricted one (title…) goes through the restricted
			// channel, the others as if typed
			initialCommands.forEach(pattern => {
				const name = pattern.split(" ")[0]
				if (getCommands()[name]?.restricted) runRestricted(pattern)
				else run(pattern)
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ready])

	const scrollDown = useCallback(() => {
		// in a frame, the frame is what scrolls: its ref replaces `scrollRef`
		const target = frame ? content.current : scrollRef?.current
		target?.scrollTo(0, 1000000)
	}, [frame, scrollRef])

	/**
	 * The end of the writing is reported on every render for as long as the
	 * command is on screen, not only as it happens: so the event fires on the
	 * flip alone, when the command was not marked rendered yet. Without that
	 * guard, `onCommandRendered` would fire again on every render of the
	 * terminal.
	 */
	const handleRendered = useCallback(
		(id: string) => {
			const { commands: played, restrictedCommands } = shellActions()
			const done = [...played, ...restrictedCommands].find(
				command => command.id === id
			)
			const first = !!done && !done.isRendered

			shellActions().setIsRendered(id)
			scrollDown()

			if (first && done.canExecute) {
				onCommandRendered?.({
					name: done.name,
					args: done.args,
					pattern: done.pattern,
				})
			}
		},
		[scrollDown, onCommandRendered]
	)

	const moveCursor = useCallback((direction: number) => {
		shellActions().moveCursor(direction)
	}, [])

	const terminal = (
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

	if (!frame) return terminal

	/**
	 * The container bounds the dragging of the window, and that is all the
	 * shell imposes: it takes the room it is given. It is up to whoever
	 * displays it to set the height, here or on what holds it.
	 */
	return (
		<div ref={area} style={{ position: "relative", height: "100%" }}>
			<Window
				ref={content}
				show={shown}
				container={area}
				title={frame.title}
				move={frame.move}
				start={frame.start}
				margin={frame.margin}
				compact={frame.compact}
				canExpand={frame.canExpand}
				canClose={frame.canClose}
				// the window only goes from here if nobody else holds it
				onClose={() => {
					if (ownFrame) setFramed(false)
					frame.onClose?.()
				}}
			>
				{terminal}
			</Window>
		</div>
	)
}
