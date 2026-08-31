import { createContext, useContext } from "react"
import { useStore } from "zustand"
import { useShallow } from "zustand/react/shallow"

import { BaseCommands } from "@types"
import type { ShellInstance } from "./instance"
import type { ShellState } from "./store"

/**
 * The shell a component belongs to. It carries the instance, not the state:
 * what changes lives in the store, and every hook below subscribes to the
 * slice it needs. A context holding the state itself would rerender the
 * whole terminal on each letter written.
 */
const ShellContext = createContext<ShellInstance | null>(null)

export const ShellProvider = ShellContext.Provider

const useInstance = (): ShellInstance => {
	const instance = useContext(ShellContext)

	if (!instance) {
		throw new Error("This hook only reads inside a <Shell>.")
	}

	return instance
}

const useShellState = <T,>(selector: (state: ShellState) => T): T =>
	useStore(useInstance().store, selector)

/** the commands this shell knows, read at render */
export const useCommands = (): BaseCommands => useInstance().commands()

/**
 * The two lists put back in the order they arrived in. The sort goes by
 * `order` and not by `timestamp`: the commands of the opening leave in the
 * same loop and land on the same millisecond, and the sort, being stable,
 * then returned the order of the two lists rather than the one of the
 * typing.
 *
 * The array is rebuilt on every call, hence useShallow: without it, the new
 * reference would trigger a render on every change of the store, even an
 * unrelated one.
 */
export const useGetCommands = () =>
	useShellState(
		useShallow(state =>
			[
				...state.commands.filter(command => command.visible),
				...state.restrictedCommands.filter(command => command.visible),
			].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		)
	)

export const useGetCursor = () => useShellState(state => state.cursor)

export const useGetCurrentCommand = () =>
	useShellState(state =>
		state.cursor === null ? null : state.commands[state.cursor] || null
	)

/**
 * The startup is over: not one restricted command left waiting to be
 * rendered, and the visitor has not typed anything yet. It is what
 * `initialCommands` plays that fills the first condition, whatever its
 * length.
 */
export const useGetStart = () =>
	useShellState(
		state =>
			state.restrictedCommands.every(command => command.isRendered) &&
			state.commands.length === 0
	)

/** last command played by the visitor, the restricted ones left out */
export const useGetLastCommand = () =>
	useShellState(state => state.commands[state.commands.length - 1] || null)

export const useLang = () => useShellState(state => state.lang)

export const useAnimation = () => useShellState(state => state.animation)

export const useThemeName = () => useShellState(state => state.themeName)

export const useKeyboardOnFocus = () =>
	useShellState(state => state.keyboardOnFocus)
