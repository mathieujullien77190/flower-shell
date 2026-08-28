import { BaseCommands } from "../types"

/**
 * Les commandes connues du shell. Elles vivent au niveau du module parce
 * que tout le monde en a besoin sans etre un composant : l'autocompletion,
 * le rendu d'une ligne, et surtout `run`, appele depuis l'exterieur — une
 * fenetre du bureau, un jeu qui se ferme. Un contexte React ne couvrirait
 * pas ce dernier cas.
 *
 * Corollaire assume : un shell par page.
 */
let registry: BaseCommands = {}

export const setCommands = (commands: BaseCommands) => {
	registry = commands
}

export const getCommands = (): BaseCommands => registry

/** les commandes restreintes rejouees au demarrage et apres un clear */
let banner: string[] = []

export const setBanner = (commands: string[]) => {
	banner = commands
}

export const getBanner = (): string[] => banner

/**
 * Le mot d'accueil, une clef du dictionnaire ou le texte lui-meme. Il ne
 * peut pas vivre dans la definition de la commande, qui est un objet fige :
 * le consommateur le donne en prop, la commande le lit — et le traduit — au
 * moment de s'executer.
 */
let welcome = ""

export const setWelcome = (text: string) => {
	welcome = text
}

export const getWelcome = (): string => welcome
