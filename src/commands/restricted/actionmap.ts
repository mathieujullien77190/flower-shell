import { BaseCommand } from "@types"
import { runHere } from "@engine/send"

/**
 * The switchboard of the clickable markers. `#label ~ cmd args#` sends
 * `actionmap cmd args`: the command shows nothing, its effect plays the
 * line it aims at. Without it a click would do nothing — this is what
 * makes the marker usable without writing anything.
 */
export const actionmapCommand: BaseCommand = {
	restricted: true,
	action: () => "",
	effect: ({ args = [] }) => runHere(args.join(" ")),
	display: { hideCmd: true },
}
