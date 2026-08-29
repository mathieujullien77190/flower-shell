import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { boxed } from "../decorators"
import { source } from "../source"

/**
 * A bare shell: `commands` is optional, so `<Shell />` mounts on its own.
 * With an empty registry nothing answers — and nothing complains either.
 * A typed line simply moves on to the next one.
 */
const meta: Meta<typeof Shell> = {
	title: "Shell/No commands",
	component: Shell,
	decorators: [boxed],
}

export default meta

export const NoCommands: StoryObj<typeof Shell> = {
	name: "No commands",
	parameters: source(`
import { Shell } from "flower-shell"

<Shell />
`),
}
