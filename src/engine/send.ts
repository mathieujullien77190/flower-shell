import { getBanner, getCommands } from "@state/registry"
import { shellActions } from "@state/store"
import { createCommand, findCommand } from "./terminalEngine"

/** prevenu a chaque commande jouee, pose par le consommateur */
let listener: (name: string, args: string[]) => void = () => {}

export const setListener = (fn?: (name: string, args: string[]) => void) => {
	listener = fn || (() => {})
}

/**
 * Joue une commande : son effet de bord d'abord, puis son ajout a
 * l'historique. Le store est un module, il n'y a pas de dispatch a
 * promener, et la fonction s'appelle donc de n'importe ou.
 */
const send = (commandPattern: string, restricted: boolean) => {
	const commands = getCommands()

	const cmd = createCommand({ commands, commandPattern, restricted })
	const baseCmd = findCommand({ commands, name: cmd.name, restricted })

	if (baseCmd?.effect && cmd.canExecute) baseCmd.effect({ args: cmd.args })

	// effacer l'ecran laisse la banniere, comme au demarrage
	if (!restricted && cmd.name === "clear" && cmd.canExecute) {
		getBanner().forEach(name => runRestricted(name))
	}

	shellActions().addCommand(cmd)

	if (cmd.canExecute) listener(cmd.name, cmd.args)
}

/** joue une commande du visiteur */
export const run = (commandPattern: string) => send(commandPattern, false)

/** joue une commande interne, que le visiteur ne peut pas taper */
export const runRestricted = (commandPattern: string) =>
	send(commandPattern, true)
