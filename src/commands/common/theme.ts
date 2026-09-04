import { BaseCommand } from "@types"
import { t } from "@i18n/lang"
import { themeByName, themeNames, themeTone } from "@theme"
import { shellActions } from "@state/instance"

export const themeCommand: BaseCommand = {
	restricted: false,
	// the themes are those of the catalogue: read as it is typed, not here
	testArgs: { authorize: themeNames, empty: false },
	action: ({ args }) => t("theme.set", { mode: args[0] }),
	// the effect plays after the action: the requested theme is set here
	effect: ({ args }) => shellActions().setThemeName(args[0]),
	/**
	 * A function, as for `lang`: the help lists the catalogue as it is at
	 * the moment it is shown. Each theme describes itself through the key
	 * `theme.<name>`.
	 *
	 * Its tone comes first — `light : …`, `dark : …` — read off its
	 * background and not off a word in the description: it is what one
	 * looks for in that list, and a theme of the consumer's answers for
	 * it like the others. Translated here, because the description is
	 * handed over already written; a background the tone cannot be read
	 * from leaves the line as it was.
	 */
	help: () => ({
		patterns: themeNames().map(name => {
			const tone = themeTone(themeByName(name))
			const description = t(`theme.${name}`)

			return {
				pattern: `theme ${name}`,
				description: tone
					? `${t(`common.${tone}`)} : ${description}`
					: description,
			}
		}),
	}),
}
