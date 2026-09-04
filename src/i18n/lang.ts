import { Dict, Dictionaries } from "@types"
import { playingInstance } from "@state/instance"
import { BASE_LANG, DEFAULT_DICT, prepareDict } from "./dict"

export { BASE_LANG } from "./dict"

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

/**
 * The dictionaries of whoever is not a shell. Every terminal carries its own
 * — its `dict` prop, held by its instance — and this one only answers `t()`
 * called outside of any command: a text of yours translated in a component
 * of yours, where no shell is in play.
 */
let outside: Dictionaries = DEFAULT_DICT

/**
 * The languages `t()` speaks outside of a shell. It does not reach into the
 * terminals of the page: a `<Shell>` takes its own through `dict`, and two
 * of them side by side no longer write into each other.
 */
export const setDict = (custom?: Dictionaries) => {
	outside = prepareDict(custom)
}

/** the dictionaries in play: those of the shell playing, else the page's */
const mounted = (): Dictionaries => playingInstance()?.dict() || outside

/**
 * The languages the `lang` command accepts: those of the shell in play. A
 * function, and not a constant: the consumer sets their dictionary long
 * after the commands have been written.
 */
export const langs = (): string[] => Object.keys(mounted())

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
 * for. Both the dictionaries and the language are read off that shell —
 * outside of a command there is none, and the dictionaries of the page
 * answer in the fallback language.
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
	const dict = mounted()
	const current = force || playingInstance()?.store.getState().lang || BASE_LANG

	const text =
		read(dict[current] || {}, key) || read(dict[BASE_LANG] || {}, key) || key

	if (!vars) return text

	return Object.entries(vars).reduce(
		(result, [name, value]) => result.split(`{${name}}`).join(`${value}`),
		text
	)
}
