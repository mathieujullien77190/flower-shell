import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { boxed } from "../decorators"
import { source } from "../source"

/**
 * The commands shipped with the package, nothing more: without a `dict` prop,
 * the shell only speaks English.
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

<Shell commands={baseCommands} />
`),
	args: {
		commands: baseCommands,
	},
}
