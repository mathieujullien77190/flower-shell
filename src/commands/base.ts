import { BaseCommands } from "@types"
import {
	animationCommand,
	clearCommand,
	flowersCommand,
	fontCommand,
	helloCommand,
	helpCommand,
	langCommand,
	themeCommand,
} from "./common"
import {
	actionmapCommand,
	argumenterrorCommand,
	titleCommand,
	unknowCommand,
	welcomeCommand,
} from "./restricted"

/**
 * The commands of the package, one file each, gathered here under the names
 * that invoke them. The two folders say who may type them: `common` is what
 * the visitor plays, `restricted` what the shell plays for itself — the
 * banner, the two errors and the switchboard of the clickable markers.
 *
 * `test` is of `common` and is missing here on purpose: it is a workbench,
 * mounted by hand through `commands={{ ...baseCommands, test }}`.
 */
export const baseCommands: BaseCommands = {
	help: helpCommand,
	clear: clearCommand,
	hello: helloCommand,
	flowers: flowersCommand,
	animation: animationCommand,
	font: fontCommand,
	theme: themeCommand,
	lang: langCommand,
	welcome: welcomeCommand,
	title: titleCommand,
	unknow: unknowCommand,
	argumenterror: argumenterrorCommand,
	actionmap: actionmapCommand,
}
