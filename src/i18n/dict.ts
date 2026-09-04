import { Dict, Dictionaries } from "@types"
import { dictEn } from "./en"

/** fallback language, when the key is missing from the current one */
export const BASE_LANG = "en"

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

/** English alone: a shell speaks one language until it is given more */
export const DEFAULT_DICT: Dictionaries = { [BASE_LANG]: dictEn }

/**
 * The dictionaries of one shell, ready to be read: the languages are exactly
 * the keys given here, and each one is laid on the English of the package —
 * a key it does not cover comes out in English rather than as a bare key.
 *
 * Given nothing, English alone.
 *
 * It lives here rather than in `lang.ts` so that an instance can prepare its
 * own without importing the module that reads the instance in play.
 */
export const prepareDict = (custom?: Dictionaries): Dictionaries => {
	if (!custom) return DEFAULT_DICT

	return Object.keys(custom).reduce(
		(all, lang) => ({ ...all, [lang]: merge(dictEn, custom[lang] || {}) }),
		{} as Dictionaries
	)
}
