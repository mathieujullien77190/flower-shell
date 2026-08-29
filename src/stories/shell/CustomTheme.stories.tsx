import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { boxed } from "../decorators"
import { source } from "../source"

/** colours and prompt: everything can be replaced, the rest keeps its defaults */
const meta: Meta<typeof Shell> = {
	title: "Shell/Custom theme",
	component: Shell,
	decorators: [boxed],
}

export default meta

export const CustomTheme: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands } from "flower-shell"

// everything can be replaced, missing values keep their defaults —
// container is the style set on the terminal's own container
<Shell
	commands={baseCommands}
	theme={{
		colors: {
			background: "#1b1b2f",
			textColor: "#e6e6e6",
			importantColor: "#e94560",
			cmdColor: "#53d8fb",
			restrictedColor: "#f0a500",
			infoColor: "#9d8df1",
			appColor: "#53d8fb",
		},
		prompt: "λ",
	}}
/>
`),
	name: "Custom theme",
	args: {
		commands: baseCommands,
		theme: {
			colors: {
				background: "#1b1b2f",
				textColor: "#e6e6e6",
				importantColor: "#e94560",
				cmdColor: "#53d8fb",
				restrictedColor: "#f0a500",
				infoColor: "#9d8df1",
				appColor: "#53d8fb",
			},
			prompt: "λ",
		},
	},
}
