import { Dict, Dictionaries } from "@types"
import { useShellStore } from "@state/store"
import { dictEn } from "./en"

/** langue de repli, quand la clef manque a la langue courante */
export const BASE_LANG = "en"

/**
 * Langue de depart, deduite du navigateur : celle que le visiteur a mise en
 * tete, si le shell la parle — c'est-a-dire si elle est dans le
 * dictionnaire monte. Sinon, la langue de repli.
 *
 * A appeler depuis un effet : navigator n'existe pas au prerendu.
 */
export const browserLang = (): string => {
	if (typeof navigator === "undefined") return BASE_LANG

	const preferred = (
		navigator.languages?.[0] ||
		navigator.language ||
		""
	).toLowerCase()

	return langs().find(lang => preferred.startsWith(lang)) || BASE_LANG
}

const merge = (base: Dict, custom: Dict): Dict => {
	const result: Dict = { ...base }

	Object.entries(custom).forEach(([key, value]) => {
		const previous = result[key]

		result[key] =
			typeof value === "object" && typeof previous === "object"
				? merge(previous, value)
				: value
	})

	return result
}

/** l'anglais seul : le shell ne parle qu'une langue tant qu'on ne lui en donne pas */
const DEFAULT_DICT: Dictionaries = { [BASE_LANG]: dictEn }

let dict: Dictionaries = DEFAULT_DICT

/**
 * Les langues du shell sont les clefs de ce qu'on donne ici — rien de plus.
 * `dict={{ en: dictEn, fr: dictFr }}` monte l'anglais et le francais ;
 * sans prop, l'anglais seul.
 *
 * Chaque langue est posee sur l'anglais du paquet : une clef que le
 * dictionnaire donne ne couvre pas sort en anglais plutot qu'en clef nue,
 * et `{ en: { app: { welcome } } }` ajoute un texte sans perdre les autres.
 */
export const setDict = (custom?: Dictionaries) => {
	if (!custom) {
		dict = DEFAULT_DICT
		return
	}

	dict = Object.keys(custom).reduce(
		(all, lang) => ({ ...all, [lang]: merge(dictEn, custom[lang] || {}) }),
		{} as Dictionaries
	)
}

/**
 * Les langues acceptees par la commande `lang` : celles du dictionnaire
 * monte. Une fonction, et non une constante : le consommateur pose son
 * dictionnaire bien apres l'ecriture des commandes.
 */
export const langs = (): string[] => Object.keys(dict)

/** descend un chemin pointe dans un dictionnaire */
const read = (source: Dict, key: string): string | null => {
	const value = key
		.split(".")
		.reduce<string | Dict | undefined>(
			(node, step) => (typeof node === "object" ? node[step] : undefined),
			source
		)

	return typeof value === "string" ? value : null
}

/**
 * Le texte d'une clef, dans la langue courante.
 *
 * Une clef absente s'affiche telle quelle — c'est ce qui permet de passer
 * un texte brut partout ou une clef est attendue.
 *
 * Le dernier parametre force la langue. Il ne sert qu'a la commande `lang`,
 * qui annonce le changement : son effet ne joue qu'apres son action, et le
 * message sortirait dans la langue qu'on vient de quitter.
 */
export const t = (
	key: string,
	vars?: Record<string, string | number>,
	force?: string
) => {
	const current = force || useShellStore.getState().lang

	const text =
		read(dict[current] || {}, key) || read(dict[BASE_LANG] || {}, key) || key

	if (!vars) return text

	return Object.entries(vars).reduce(
		(result, [name, value]) => result.split(`{${name}}`).join(`${value}`),
		text
	)
}
