import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
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
import { Shell, baseCommands, test } from "flower-shell"

// title then welcome: the opening is a pair of commands like any other.
// welcome prints \`welcome.text\`, which the package already carries —
// override that key through \`dict\` to put your own words there.
// test rides along: it ships beside baseCommands, not inside it.
<Shell
	commands={{ ...baseCommands, test }}
	initialCommands={["title", "welcome"]}
/>
`),
	args: {
		commands: { ...baseCommands, test },
		initialCommands: ["title", "welcome"],
	},
}
