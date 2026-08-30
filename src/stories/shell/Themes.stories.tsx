import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { boxed } from "../decorators"
import { source } from "../source"

/**
 * The catalogue, the way an editor offers one. Eight themes ship with the
 * package; the consumer hands one to the `theme` prop, and the visitor
 * switches at will with `theme <name>`.
 *
 * Type `help theme` for the list, then `theme nord`, `theme gruvbox`,
 * `theme solarized` — the prompt, the output and the frame follow.
 */
const meta: Meta<typeof Shell> = {
	title: "Shell/Themes",
	component: Shell,
	decorators: [boxed],
}

export default meta

export const Themes: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands, test, nordTheme, themes } from "flower-shell"

// one theme, chosen up front
<Shell commands={{ ...baseCommands, test }} theme={nordTheme} />

// or the whole catalogue, indexed by the name the visitor types
<Shell commands={{ ...baseCommands, test }} theme={themes.gruvbox} />

// either way, \`theme <name>\` switches live: flower, dark, light,
// dracula, nord, gruvbox, monokai, solarized
`),
	args: {
		commands: { ...baseCommands, test },
		initialCommands: ["title", "welcome"],
		dict: {
			en: { welcome: { text: "Try \`theme nord\`, or \`help theme\` for the list" } },
		},
	},
}
