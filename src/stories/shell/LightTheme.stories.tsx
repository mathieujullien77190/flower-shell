import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { lightTheme } from "../../theme"
import { boxed } from "../decorators"
import { source } from "../source"

/** the light theme shipped with the package: parchment background, darkened colours */
const meta: Meta<typeof Shell> = {
	title: "Shell/Light theme",
	component: Shell,
	decorators: [boxed],
}

export default meta

export const LightTheme: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands, lightTheme } from "flower-shell"

<Shell commands={baseCommands} theme={lightTheme} />
`),
	name: "Light theme",
	args: {
		commands: baseCommands,
		theme: lightTheme,
	},
}
