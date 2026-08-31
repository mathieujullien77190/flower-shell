import { BaseCommands } from "@types"

/**
 * The commands the shell knows. They live at module level because everyone
 * needs them without being a component: the autocompletion, the rendering
 * of a line, and above all `run`, called from outside — a window of the
 * desktop, a game being closed. A React context would not cover that last
 * case.
 *
 * Corollary, knowingly: one shell per page.
 */
let registry: BaseCommands = {}

export const setCommands = (commands: BaseCommands) => {
	registry = commands
}

export const getCommands = (): BaseCommands => registry
