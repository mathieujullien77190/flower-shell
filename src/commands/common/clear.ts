import { BaseCommand } from "@types"
import { shellActions } from "@state/instance"

export const clearCommand: BaseCommand = {
	restricted: false,
	action: () => "",
	// the history is empty, but the banner is played again right after
	effect: () => shellActions().clear(),
	help: {
		patterns: [{ pattern: "clear", description: "clear.usage" }],
	},
}
