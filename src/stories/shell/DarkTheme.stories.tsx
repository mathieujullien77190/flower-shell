import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { darkTheme } from "../../theme"
import { boxed } from "../decorators"
import { source } from "../source"

/**
 * The neutral dark theme, for a plain terminal: no flower on the prompt, no
 * petal on the palette. The package default is `flowerTheme`, so this one
 * has to be asked for.
 */
const meta: Meta<typeof Shell> = {
	title: "Shell/Dark theme",
	component: Shell,
	decorators: [boxed],
}

export default meta

export const DarkTheme: StoryObj<typeof Shell> = {
	name: "Dark theme",
	parameters: source(`
import { Shell, baseCommands, darkTheme } from "flower-shell"

<Shell commands={baseCommands} theme={darkTheme} />
`),
	args: {
		commands: baseCommands,
		theme: darkTheme,
	},
}
