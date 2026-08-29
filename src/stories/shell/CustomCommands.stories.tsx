import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { BaseCommand } from "../../types"
import { boxed } from "../decorators"
import { source } from "../source"

/**
 * A custom command, written without a dictionary: its texts are spelled out
 * where they are used. `help` reads the description as it stands. A `dict`
 * only becomes useful once the same command has to speak more than one
 * language.
 */
const ping: BaseCommand = {
	restricted: false,
	action: ({ args }) => (args.length === 0 ? "pong!" : `pong ${args.join(" ")}`),
	help: {
		patterns: [{ pattern: "ping [text]", description: "answers pong" }],
	},
}

const meta: Meta<typeof Shell> = {
	title: "Shell/Custom commands",
	component: Shell,
	decorators: [boxed],
}

export default meta

/** a custom command is added to the object, the rest stays put */
export const CustomCommands: StoryObj<typeof Shell> = {
	name: "Custom commands",
	parameters: source(`
import { Shell, baseCommands } from "flower-shell"
import type { BaseCommand } from "flower-shell"

// the texts are written where they are used: no dictionary, no keys.
// help reads the description as it stands.
const ping: BaseCommand = {
	restricted: false,
	action: ({ args }) => (args.length === 0 ? "pong!" : \`pong \${args.join(" ")}\`),
	help: {
		patterns: [{ pattern: "ping [text]", description: "answers pong" }],
	},
}

// the command is added to the object, the rest stays put
<Shell commands={{ ...baseCommands, ping }} />
`),
	args: {
		commands: { ...baseCommands, ping },
	},
}
