import { Dict, Dictionaries } from "@types"
import { playingInstance } from "@state/instance"
import { dictEn } from "./en"

/** fallback language, when the key is missing from the current one */
export const BASE_LANG = "en"

/**
 * Starting language, read off the browser: the one the visitor put first, if
 * the shell speaks it — that is, if it is in the mounted dictionary.
 * Otherwise, the fallback language.
 *
 * To be called from an effect: navigator does not exist at prerender.
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

/** English alone: the shell speaks one language until it is given more */
const DEFAULT_DICT: Dictionaries = { [BASE_LANG]: dictEn }

let dict: Dictionaries = DEFAULT_DICT

/**
 * The languages of the shell are the keys of what is given here — nothing
 * more. `dict={{ en: dictEn, fr: dictFr }}` mounts English and French;
 * without the prop, English alone.
 *
 * Each language is laid on the English of the package: a key the given
 * dictionary does not cover comes out in English rather than as a bare key,
 * and `{ en: { welcome: { text } } }` covers a single text without losing
 * the others.
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
 * The languages the `lang` command accepts: those of the mounted
 * dictionary. A function, and not a constant: the consumer sets their
 * dictionary long after the commands have been written.
 */
export const langs = (): string[] => Object.keys(dict)

/** walks a dotted path down a dictionary */
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
 * The text of a key, in the language of the shell the command is playing
 * for. The dictionaries are shared by every terminal on the page; the
 * language is not, so it is read off the shell in play — outside of a
 * command there is none, and the fallback language answers.
 *
 * A key that is missing shows up as it is — that is what allows a raw text
 * to be passed anywhere a key is expected.
 *
 * The last parameter forces the language. It only serves the `lang` command,
 * which announces the change: its effect plays after its action, and the
 * message would come out in the language just left behind.
 */
export const t = (
	key: string,
	vars?: Record<string, string | number>,
	force?: string
) => {
	const current = force || playingInstance()?.store.getState().lang || BASE_LANG

	const text =
		read(dict[current] || {}, key) || read(dict[BASE_LANG] || {}, key) || key

	if (!vars) return text

	return Object.entries(vars).reduce(
		(result, [name, value]) => result.split(`{${name}}`).join(`${value}`),
		text
	)
}
