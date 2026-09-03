import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { themes } from "../../theme"
import { boxed } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"
import en from "./Welcome.en.md?raw"
import fr from "./Welcome.fr.md?raw"
import flowerShellCode from "./FlowerShell.source.md?raw"

// The page one lands on: the package running, not its list of props. It is
// first in the sort of `preview.tsx`, and so it is the one the published
// site serves.
//
// As line comments, and not as a block: a block above the meta makes the CSF
// plugin inject its own `parameters`, which cover ours — and the prose would
// disappear along with them.
const meta: Meta<typeof Shell> = {
	title: "flower-shell",
	component: Shell,
	decorators: [boxed],
	parameters: prose({ en, fr }),
}

export default meta

export const FlowerShell: StoryObj<typeof Shell> = {
	name: "flower-shell",
	parameters: source(flowerShellCode),
	args: {
		commands: { ...baseCommands, test },
		themes,
		initialCommands: ["title", "welcome"],
	},
}
