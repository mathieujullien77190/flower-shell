import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { run } from "../../engine/send"
import { BaseCommand } from "../../types"
import { boxed } from "../decorators"
import { source } from "../source"

/**
 * A clickable link in the output that runs a command. The `#label ~ cmd args#`
 * marker shows `label` and, on click, dispatches `actionmap cmd args`. So a
 * custom `actionmap` command routes the click by running that command line.
 */
const menu: BaseCommand = {
	restricted: true,
	action: () => "Try it → #click to say hello ~ hello#",
	display: { hideCmd: true },
}

/** the router: a click sends `actionmap <cmd>`, its effect runs `<cmd>` */
const actionmap: BaseCommand = {
	restricted: true,
	action: () => "",
	effect: ({ args = [] }) => run(args.join(" ")),
	display: { hideCmd: true },
}

const meta: Meta<typeof Shell> = {
	title: "Shell/Clickable command",
	component: Shell,
	decorators: [boxed],
}

export default meta

export const ClickableCommand: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands, run } from "flower-shell"
import type { BaseCommand } from "flower-shell"

// #label ~ cmd args# shows label and, on click, dispatches
// actionmap cmd args
const menu: BaseCommand = {
	restricted: true,
	action: () => "Try it → #click to say hello ~ hello#",
	display: { hideCmd: true },
}

// the router: a click sends actionmap <cmd>, its effect runs <cmd>
const actionmap: BaseCommand = {
	restricted: true,
	action: () => "",
	effect: ({ args = [] }) => run(args.join(" ")),
	display: { hideCmd: true },
}

// the banner plays menu at startup, so the link shows right away
<Shell commands={{ ...baseCommands, menu, actionmap }} banner={["menu"]} />
`),
	name: "Clickable command",
	args: {
		commands: { ...baseCommands, menu, actionmap },
		// the banner plays `menu` at startup, so the link shows right away
		banner: ["menu"],
	},
}
