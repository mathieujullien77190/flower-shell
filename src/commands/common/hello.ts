import { BaseCommand } from "@types"
import { t } from "@i18n/lang"

export const helloCommand: BaseCommand = {
	restricted: false,
	action: ({ args }) =>
		args.length === 0 ? t("hello.world") : `Hello ${args.join(" ")}`,
	help: {
		patterns: [
			{ pattern: "hello", description: "hello.usage" },
			{ pattern: "hello [text]", description: "hello.usageArgs" },
		],
	},
}
