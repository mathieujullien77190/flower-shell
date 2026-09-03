import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../../Shell"
import { baseCommands } from "../../../commands/base"
import { test } from "../../../commands/test"
import { themes } from "../../../theme"
import { boxed } from "../../decorators"
import { prose } from "../../i18n"
import { source } from "../../source"
import en from "./Minimal.en.md?raw"
import fr from "./Minimal.fr.md?raw"
import minimalCode from "./Minimal.source.md?raw"

const meta: Meta<typeof Shell> = {
	title: "Shell/Minimal",
	component: Shell,
	decorators: [boxed],
	parameters: prose({ en, fr }),
}

export default meta

export const Minimal: StoryObj<typeof Shell> = {
	parameters: source(minimalCode),
	args: {
		commands: { ...baseCommands, test },
		themes,
		initialCommands: ["title", "welcome"],
	},
}
