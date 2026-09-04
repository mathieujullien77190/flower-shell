import { BaseCommand } from "@types"
import { t } from "@i18n/lang"
import { shellActions } from "@state/instance"

export const fontCommand: BaseCommand = {
	restricted: false,
	testArgs: { authorize: ["+", "-", "reset"], empty: false },
	/**
	 * It announces the move and not the size it lands on: the action runs
	 * before the effect, so the number it could name would be the one it
	 * is leaving. The eye reads the answer at its new size anyway.
	 */
	action: ({ args }) =>
		args[0] === "+"
			? t("font.bigger")
			: args[0] === "-"
				? t("font.smaller")
				: t("font.back"),
	effect: ({ args }) => {
		if (args[0] === "reset") shellActions().resetFont()
		else shellActions().zoomFont(args[0] === "+" ? 1 : -1)
	},
	help: {
		patterns: [
			// the plus is escaped: it is a marker of the markup, and a bare
			// one here would pair with the `+name+` the help puts around
			// every command, coloring everything in between
			{ pattern: "font \\+", description: "font.up" },
			{ pattern: "font -", description: "font.down" },
			{ pattern: "font reset", description: "font.reset" },
		],
	},
}
