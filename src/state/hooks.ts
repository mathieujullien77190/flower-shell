import { useStore } from "zustand"
import { useShallow } from "zustand/react/shallow"

import { BaseCommands } from "@types"
import type { ShellInstance } from "./instance"
import type { ShellState } from "./store"

/**
 * A slice of the store of one shell, and nothing more. The instance is
 * handed down as a prop rather than read off a context: there are three
 * components to reach, they are two levels apart, and a context carrying the
 * state would paint the whole terminal on every line written.
 *
 * Every hook below takes the shell it reads, so the same component could
 * render two of them and never mix their histories.
 */
const useShellState = <T>(
	instance: ShellInstance,
	selector: (state: ShellState) => T
): T => useStore(instance.store, selector)

/**
 * The commands this shell knows, read at render. Not a slice of the store:
 * they are the `commands` prop as it stands, and a change of prop paints
 * anyway.
 */
export const useCommands = (instance: ShellInstance): BaseCommands =>
	instance.commands()

/**
 * The two lists put back in the order they arrived in. The sort goes by
 * `order` and not by `timestamp`: the commands of the opening leave in the
 * same loop and land on the same millisecond, and the sort, being stable,
 * then returned the order of the two lists rather than the one of the
 * typing.
 *
 * The array is rebuilt on every call, hence `useShallow`: without it the new
 * reference would paint on every change of the store, an unrelated one
 * included.
 */
export const useGetCommands = (instance: ShellInstance) =>
	useShellState(
		instance,
		useShallow((state: ShellState) =>
			[
				...state.commands.filter(command => command.visible),
				...state.restrictedCommands.filter(command => command.visible),
			].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		)
	)

export const useGetCursor = (instance: ShellInstance) =>
	useShellState(instance, state => state.cursor)

export const useGetCurrentCommand = (instance: ShellInstance) =>
	useShellState(instance, state =>
		state.cursor === null ? null : state.commands[state.cursor] || null
	)

/**
 * The startup is over: not one restricted command left waiting to be
 * rendered, and the visitor has not typed anything yet. It is what
 * `initialCommands` plays that fills the first condition, whatever its
 * length.
 */
export const useGetStart = (instance: ShellInstance) =>
	useShellState(
		instance,
		state =>
			state.restrictedCommands.every(command => command.isRendered) &&
			state.commands.length === 0
	)

/** last command played by the visitor, the restricted ones left out */
export const useGetLastCommand = (instance: ShellInstance) =>
	useShellState(
		instance,
		state => state.commands[state.commands.length - 1] || null
	)

export const useLang = (instance: ShellInstance) =>
	useShellState(instance, state => state.lang)

export const useAnimation = (instance: ShellInstance) =>
	useShellState(instance, state => state.animation)

export const useThemeName = (instance: ShellInstance) =>
	useShellState(instance, state => state.themeName)

export const useKeyboardOnFocus = (instance: ShellInstance) =>
	useShellState(instance, state => state.keyboardOnFocus)

/** the size the visitor set, or null on the one of the theme */
export const useFontSize = (instance: ShellInstance) =>
	useShellState(instance, state => state.fontSize)
