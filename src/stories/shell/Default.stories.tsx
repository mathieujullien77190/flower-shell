import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { boxed } from "../decorators"
import { source } from "../source"

/**
 * The commands shipped with the package, and the usual opening: the logo,
 * then the welcome message, chained through `initialCommands`. Without a
 * `dict` prop the shell only speaks English, and it wears `flowerTheme` —
 * the package default, flower on the prompt included.
 */
const meta: Meta<typeof Shell> = {
	title: "Shell/Default",
	component: Shell,
	decorators: [boxed],
}

export default meta

export const Default: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands } from "flower-shell"

// title then welcome: the opening is a pair of commands like any other.
// welcome only holds the text — the command is what prints it.
<Shell
	commands={baseCommands}
	welcome="app.welcome"
	initialCommands={["title", "welcome"]}
	dict={{ en: { app: { welcome: "Type \`help\` to list the commands" } } }}
/>
`),
	args: {
		commands: baseCommands,
		welcome: "app.welcome",
		initialCommands: ["title", "welcome"],
		dict: {
			en: { app: { welcome: "Type `help` to list the commands" } },
		},
	},
}
