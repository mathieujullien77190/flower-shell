import { createContext, useContext, useMemo, useState } from "react"

import { BaseCommands } from "@types"
import type { ShellInstance } from "./instance"
import type { ShellData } from "./store"

type Seen = { instance: ShellInstance; data: ShellData }

/**
 * The shell a component belongs to, and its values as they were last
 * rendered. The instance holds the truth — a command reads it outside of any
 * render — and the context carries a copy so React knows when to paint.
 */
const ShellContext = createContext<Seen | null>(null)

const useSeen = (): Seen => {
	const seen = useContext(ShellContext)

	if (!seen) {
		throw new Error("This hook only reads inside a <Shell>.")
	}

	return seen
}

const useData = (): ShellData => useSeen().data

/**
 * Holds what the terminal renders. The instance writes first and calls back
 * here, which is the only thing that turns a played command into a screen.
 *
 * Internal, and not the `<ShellProvider>` a consumer mounts: that one is a
 * registry of terminals to command, and lives in `registry.tsx`.
 */
export const ShellScreenState = ({
	instance,
	children,
}: {
	instance: ShellInstance
	children: React.ReactNode
}) => {
	const [data, setData] = useState(instance.data)

	// hooked up before the first render: the opening plays on mount, and its
	// lines would otherwise be written with nobody listening
	useState(() => {
		instance.onChange(setData)
		return true
	})

	const seen = useMemo(() => ({ instance, data }), [instance, data])

	return <ShellContext.Provider value={seen}>{children}</ShellContext.Provider>
}

/** the commands this shell knows, read at render */
export const useCommands = (): BaseCommands => useSeen().instance.commands()

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

/** the size the visitor set, or null on the one of the theme */
export const useFontSize = () => useData().fontSize

/** the instance itself, for what has to write into it */
export const useInstance = (): ShellInstance => useSeen().instance
