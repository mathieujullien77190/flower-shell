import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { boxed } from "../decorators"
import { source } from "../source"

/**
 * The same opening, put in `banner` instead of `initialCommands`. That is
 * the whole difference between the two: the banner is replayed after a
 * `clear`, so the logo and the welcome come back. Type `clear` and see.
 */
const meta: Meta<typeof Shell> = {
	title: "Shell/Opening after clear",
	component: Shell,
	decorators: [boxed],
}

export default meta

export const Opening: StoryObj<typeof Shell> = {
	name: "Opening after clear",
	parameters: source(`
import { Shell, baseCommands, test } from "flower-shell"

// banner instead of initialCommands: played at startup, and again
// after every clear
<Shell commands={{ ...baseCommands, test }} banner={["title", "welcome"]} />
`),
	args: {
		commands: { ...baseCommands, test },
		banner: ["title", "welcome"],
	},
}
