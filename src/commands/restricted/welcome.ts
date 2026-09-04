import { BaseCommand } from "@types"
import { t } from "@i18n/lang"
import { colors } from "@theme"

export const welcomeCommand: BaseCommand = {
	restricted: true,
	// a command like the others: its text is a key of the dictionary,
	// which the consumer covers through `dict`
	action: () => t("welcome.text"),
	help: { description: "common.restricted", patterns: [] },
	display: {
		hideCmd: true,
		style: { color: colors().importantColor },
	},
}
