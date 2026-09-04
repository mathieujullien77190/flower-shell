import { BaseCommand } from "@types"
import { t } from "@i18n/lang"
import { shellActions } from "@state/instance"

export const animationCommand: BaseCommand = {
	restricted: false,
	testArgs: { authorize: ["on", "off"], empty: false },
	action: ({ args }) =>
		args[0] === "on" ? t("animation.enabled") : t("animation.disabled"),
	effect: ({ args }) => shellActions().setAnimation(args[0] === "on"),
	help: {
		patterns: [
			{ pattern: "animation on", description: "animation.on" },
			{ pattern: "animation off", description: "animation.off" },
		],
	},
}
