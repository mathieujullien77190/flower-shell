import { Ref, RefObject, useCallback, useImperativeHandle } from "react"

import Terminal from "./render/Terminal"

import {
	ShellProvider,
	useAnimation,
	useGetCommands,
	useGetCurrentCommand,
	useInstance,
	useKeyboardOnFocus,
	useLang,
	useMaybeShellContext,
	useShell,
} from "./state/context"
import type { ShellHandle } from "./state/context"

export type ShellProps = {
	/**
	 * The handle on this terminal, for whoever is outside React — a game that
	 * ends, a timer. Anything inside the provider takes `useShell()` instead
	 * and needs no ref at all.
	 */
	ref?: Ref<ShellHandle>
	/**
	 * Element to scroll as the output grows: the box holding the shell, when
	 * it has a scroll of its own. Without it, nothing scrolls on its own and
	 * a long output goes past whatever holds the shell.
	 */
	scrollRef?: RefObject<HTMLElement | null>
}

/**
 * The screen of a terminal: the list of the commands played and the input
 * line. What that terminal is — its commands, its themes, its languages, the
 * events it reports — is set on the `<ShellProvider>` above it.
 *
 * It takes the room it is given and nothing more: the height, the frame and
 * the place on the page belong to whoever displays it.
 *
 * Without a provider above, it makes one of its own and stands alone: a bare
 * terminal, no command, nothing painted. That is `<Shell />` on its own, and
 * it is a legitimate way to see the thing run.
 */
export const Shell = ({ ref, scrollRef }: ShellProps) => {
	const above = useMaybeShellContext()

	if (above) return <Screen ref={ref} scrollRef={scrollRef} />

	return (
		<ShellProvider>
			<Screen ref={ref} scrollRef={scrollRef} />
		</ShellProvider>
	)
}

/**
 * The terminal itself, under the provider: the hooks below read the values of
 * the instance above, which is why this is a component of its own.
 */
const Screen = ({ ref, scrollRef }: ShellProps) => {
	const instance = useInstance()
	const handle = useShell()

	useImperativeHandle(ref, () => handle, [handle])

	const history = useGetCommands()
	const currentCommand = useGetCurrentCommand()

	const options = {
		lang: useLang(),
		animation: useAnimation(),
		keyboardOnFocus: useKeyboardOnFocus(),
	}

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
			const { commands, restrictedCommands } = instance.data()
			const done = [...commands, ...restrictedCommands].find(
				command => command.id === id
			)
			const first = !!done && !done.isRendered

			instance.actions.setIsRendered(id)
			scrollDown()

			if (first && done.canExecute) {
				instance.listeners().rendered?.({
					name: done.name,
					args: done.args,
					pattern: done.pattern,
				})
			}
		},
		[instance, scrollDown]
	)

	const moveCursor = useCallback(
		(direction: number) => {
			instance.actions.moveCursor(direction)
		},
		[instance]
	)

	return (
		<Terminal
			options={options}
			commands={history}
			currentCommand={currentCommand}
			onSendCommand={handle.run}
			onSendRestrictedCommand={handle.runRestricted}
			onAnimateCommand={scrollDown}
			onSendPreviousCommand={() => moveCursor(-1)}
			onSendNextCommand={() => moveCursor(1)}
			onRendered={handleRendered}
		/>
	)
}
