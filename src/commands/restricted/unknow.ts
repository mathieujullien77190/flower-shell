import { BaseCommand } from "@types"
import { t } from "@i18n/lang"

/** what a line that names no known command answers */
export const unknowCommand: BaseCommand = {
	restricted: true,
	action: ({ args }) => t("error.unknown", { name: args[0] }),
	help: { description: "common.restricted", patterns: [] },
}
