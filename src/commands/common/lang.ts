import { BaseCommand } from "@types"
import { langs, t } from "@i18n/lang"
import { shellActions } from "@state/instance"

export const langCommand: BaseCommand = {
	restricted: false,
	// the languages are those of the dictionary: read as it is typed, not here
	testArgs: { authorize: langs, empty: false },
	// the effect plays after the action: the requested language is forced here
	action: ({ args }) => t("lang.set", { lang: args[0] }, args[0]),
	effect: ({ args }) => shellActions().setLang(args[0]),
	/**
	 * A function: the help lists the languages actually mounted, those of
	 * the consumer's dictionary. Each one describes itself through the key
	 * `lang.<code>` — up to them to provide it for theirs, or the key
	 * shows up as it is.
	 */
	help: () => ({
		patterns: langs().map(lang => ({
			pattern: `lang ${lang}`,
			description: `lang.${lang}`,
		})),
	}),
}
