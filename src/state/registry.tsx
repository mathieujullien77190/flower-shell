import { createContext, useContext, useMemo, useState } from "react"

import { createRunners } from "@engine/send"
import type { ShellInstance } from "./instance"
import type { ShellState } from "./store"

/** the terminals that can be commanded, by the `id` each one was given */
export type ShellRegistry = Map<string, ShellInstance>

const RegistryContext = createContext<ShellRegistry | null>(null)

/**
 * A place to find a terminal, and nothing else. It carries no configuration:
 * what a shell is stays on the `<Shell>` that mounts it.
 *
 * A shell only enters it if it was given an `id` — no id, no way to command
 * it. That is the whole rule, and it is why nothing here has to guess which
 * terminal was meant.
 */
export const ShellProvider = ({ children }: { children: React.ReactNode }) => {
	const [registry] = useState<ShellRegistry>(() => new Map())

	return (
		<RegistryContext.Provider value={registry}>
			{children}
		</RegistryContext.Provider>
	)
}

/** the registry above, or null when there is none — a shell may live alone */
export const useRegistry = (): ShellRegistry | null =>
	useContext(RegistryContext)

/** what commands a terminal: the id first, since that is what is being aimed at */
export type ShellControls = {
	/** plays a line on that shell, as if the visitor had typed it */
	run: (id: string, commandPattern: string) => void
	/** plays a line the visitor cannot type */
	runRestricted: (id: string, commandPattern: string) => void
	/** the state of that shell, read fresh: history, cursor, options */
	actions: (id: string) => ShellState
}

/**
 * The terminals under the provider, addressed by their `id`.
 *
 * The id is read when the method is called, not when the hook runs: a toolbar
 * placed before the shell in the tree renders before it exists, and by the
 * time anyone clicks, the shell is there. Nothing to subscribe to, nothing to
 * wait for.
 */
export const useShell = (): ShellControls => {
	const registry = useContext(RegistryContext)

	if (!registry) {
		throw new Error("useShell() only reads inside a <ShellProvider>.")
	}

	return useMemo(() => {
		const find = (id: string) => {
			const instance = registry.get(id)

			if (!instance) {
				const mounted = [...registry.keys()]
				throw new Error(
					`No shell is mounted under the id "${id}". ` +
						(mounted.length
							? `Mounted right now: ${mounted.map(name => `"${name}"`).join(", ")}.`
							: "None is: a shell only enters the registry if it was given an `id`.")
				)
			}

			return instance
		}

		return {
			run: (id, commandPattern) => createRunners(find(id)).run(commandPattern),
			runRestricted: (id, commandPattern) =>
				createRunners(find(id)).runRestricted(commandPattern),
			actions: id => {
				const instance = find(id)

				return { ...instance.data(), ...instance.actions }
			},
		}
	}, [registry])
}
