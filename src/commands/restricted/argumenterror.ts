import { BaseCommand } from "@types"
import { t } from "@i18n/lang"

/** what a known command answers when its arguments do not pass */
export const argumenterrorCommand: BaseCommand = {
	restricted: true,
	action: () => t("error.args"),
	help: { description: "common.restricted", patterns: [] },
}
