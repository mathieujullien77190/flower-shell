import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { boxed } from "../decorators"
import { source } from "../source"

/**
 * The opening: the package logo, then the consumer's welcome message. The
 * `welcome` is a dictionary key, resolved when the command plays.
 */
const meta: Meta<typeof Shell> = {
	title: "Shell/Opening",
	component: Shell,
	decorators: [boxed],
}

export default meta

export const Opening: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands } from "flower-shell"

<Shell
	commands={baseCommands}
	showTitle
	welcome="app.welcome"
	// a key added to the package English: the rest of the texts still hold
	dict={{ en: { app: { welcome: "Type \`help\` to list the commands" } } }}
/>
`),
	args: {
		commands: baseCommands,
		showTitle: true,
		welcome: "app.welcome",
		// a key added to the package English: the rest of the texts still hold
		dict: {
			en: { app: { welcome: "Type `help` to list the commands" } },
		},
	},
}
