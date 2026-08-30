import { getCommands } from "@state/registry"
import { shellActions } from "@state/store"
import { createCommand, findCommand } from "./terminalEngine"

/** ce que recoit un temoin : la ligne envoyee, entiere et decoupee */
export type CommandEvent = {
	/** le nom : le premier mot de la ligne */
	name: string
	/** les arguments : le reste de la ligne, mot a mot */
	args: string[]
	/** la ligne entiere, telle qu'elle a ete envoyee */
	pattern: string
}

/** pourquoi la commande n'a pas joue */
export type CommandErrorReason =
	/** aucune commande de ce nom dans le registre */
	| "unknown"
	/** la commande existe, ses arguments ne passent pas */
	| "args"
	/** son action ou son effet a leve */
	| "thrown"

export type CommandErrorEvent = CommandEvent & {
	reason: CommandErrorReason
	/** ce qui a ete leve, pour la seule raison `thrown` */
	error?: unknown
}

export type CommandListener = (event: CommandEvent) => void
export type CommandErrorListener = (event: CommandErrorEvent) => void

const NO_LISTENER = () => {}

/**
 * Les temoins que ce module peut prevenir, poses par le consommateur. Celui
 * de la fin d'ecriture appartient au rendu et vit dans le shell : ici, rien
 * ne sait ce qui est a l'ecran.
 */
let onStart: CommandListener = NO_LISTENER
let onDone: CommandListener = NO_LISTENER
let onError: CommandErrorListener = NO_LISTENER

export const setListeners = (listeners: {
	start?: CommandListener
	done?: CommandListener
	error?: CommandErrorListener
}) => {
	onStart = listeners.start || NO_LISTENER
	onDone = listeners.done || NO_LISTENER
	onError = listeners.error || NO_LISTENER
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
	const event: CommandEvent = {
		name: split[0],
		args: split.slice(1),
		pattern: commandPattern,
	}

	onStart(event)

	let cmd
	try {
		cmd = createCommand({ commands, commandPattern, restricted })
	} catch (error) {
		// l'action a leve : la commande n'existe meme pas assez pour etre
		// ajoutee a l'historique, il n'y a que l'erreur a rendre
		onError({ ...event, reason: "thrown", error })
		return
	}

	const baseCmd = findCommand({ commands, name: cmd.name, restricted })

	if (baseCmd?.effect && cmd.canExecute) {
		try {
			baseCmd.effect({ args: cmd.args })
		} catch (error) {
			// l'effet a leve apres que l'action a rendu son texte : la ligne
			// s'affiche quand meme, le consommateur apprend que le reste a rate
			onError({ ...event, reason: "thrown", error })
		}
	}

	shellActions().addCommand(cmd)

	if (cmd.canExecute) {
		// l'action a rendu son texte et l'effet a joue : la commande est faite,
		// meme si rien n'est encore a l'ecran
		onDone(event)
		return
	}

	/**
	 * Un shell sans aucune commande laisse passer ce qu'on lui tape — c'est
	 * un choix du consommateur, pas une faute du visiteur, et rien n'est
	 * donc a signaler. Ailleurs, la ligne n'a pas joue : soit le nom est
	 * inconnu, soit il existe et ses arguments ne passent pas.
	 */
	if (Object.keys(commands).length === 0) return

	onError({ ...event, reason: baseCmd ? "args" : "unknown" })
}

/** joue une commande du visiteur */
export const run = (commandPattern: string) => send(commandPattern, false)

/** joue une commande interne, que le visiteur ne peut pas taper */
export const runRestricted = (commandPattern: string) =>
	send(commandPattern, true)
