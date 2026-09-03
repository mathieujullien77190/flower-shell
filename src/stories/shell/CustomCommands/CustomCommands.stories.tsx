import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../../Shell"
import { baseCommands } from "../../../commands/base"
import { test } from "../../../commands/test"
import { themes } from "../../../theme"
import { BaseCommand } from "../../../types"
import { boxed } from "../../decorators"
import { prose } from "../../i18n"
import { source } from "../../source"
import en from "./CustomCommands.en.md?raw"
import fr from "./CustomCommands.fr.md?raw"
import customCommandsCode from "./CustomCommands.source.md?raw"

/** the command of the story: its texts are written where they are used */
const ping: BaseCommand = {
	restricted: false,
	action: ({ args }) =>
		args.length === 0 ? "pong!" : `pong ${args.join(" ")}`,
	help: {
		patterns: [{ pattern: "ping [text]", description: "answers pong" }],
	},
}

const meta: Meta<typeof Shell> = {
	title: "Shell/Custom commands",
	component: Shell,
	decorators: [boxed],
	parameters: prose({ en, fr }),
}

export default meta

/** a custom command is added to the object, the rest stays put */
export const CustomCommands: StoryObj<typeof Shell> = {
	name: "Custom commands",
	parameters: source(customCommandsCode),
	args: {
		commands: { ...baseCommands, test, ping },
		themes,
		initialCommands: ["help ping"],
	},
}
