import { getCommands } from "@state/registry"
import { shellActions } from "@state/store"
import { createCommand, findCommand } from "./terminalEngine"

/** ce que recoit un temoin : le nom de la commande, et ses arguments */
export type CommandListener = (name: string, args: string[]) => void

const NO_LISTENER: CommandListener = () => {}

/**
 * Les deux temoins que ce module peut prevenir, poses par le consommateur.
 * Le troisieme — la commande a fini de s'ecrire — appartient au rendu et
 * vit dans le shell : ici, rien ne sait ce qui est a l'ecran.
 */
let onStart: CommandListener = NO_LISTENER
let onDone: CommandListener = NO_LISTENER

export const setListeners = (listeners: {
	start?: CommandListener
	done?: CommandListener
}) => {
	onStart = listeners.start || NO_LISTENER
	onDone = listeners.done || NO_LISTENER
}

/**
 * Joue une commande : son effet de bord d'abord, puis son ajout a
 * l'historique. Le store est un module, il n'y a pas de dispatch a
 * promener, et la fonction s'appelle donc de n'importe ou.
 */
const send = (commandPattern: string, restricted: boolean) => {
	const commands = getCommands()

	/**
	 * Le depart se signale avant `createCommand`, qui joue deja l'action :
	 * apres, il serait trop tard pour etre un « avant ». Le nom et les
	 * arguments viennent donc de la ligne elle-meme, et non de la commande
	 * — a ce moment le shell ne sait pas encore s'il en connait une.
	 */
	const split = commandPattern.split(" ")
	onStart(split[0], split.slice(1))

	const cmd = createCommand({ commands, commandPattern, restricted })
	const baseCmd = findCommand({ commands, name: cmd.name, restricted })

	if (baseCmd?.effect && cmd.canExecute) baseCmd.effect({ args: cmd.args })

	shellActions().addCommand(cmd)

	// l'action a rendu son texte et l'effet a joue : la commande est faite,
	// meme si rien n'est encore a l'ecran
	if (cmd.canExecute) onDone(cmd.name, cmd.args)
}

/** joue une commande du visiteur */
export const run = (commandPattern: string) => send(commandPattern, false)

/** joue une commande interne, que le visiteur ne peut pas taper */
export const runRestricted = (commandPattern: string) =>
	send(commandPattern, true)
