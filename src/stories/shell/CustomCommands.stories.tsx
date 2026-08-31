import type { Meta, StoryObj } from "@storybook/react-vite"

import { ShellProvider } from "../../state/context"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { themes } from "../../theme"
import { BaseCommand } from "../../types"
import { boxed, inProvider } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

/** the command of the story: its texts are written where they are used */
const ping: BaseCommand = {
	restricted: false,
	action: ({ args }) =>
		args.length === 0 ? "pong!" : `pong ${args.join(" ")}`,
	help: {
		patterns: [{ pattern: "ping [text]", description: "answers pong" }],
	},
}

const meta: Meta<typeof ShellProvider> = {
	title: "Shell/Custom commands",
	component: ShellProvider,
	decorators: [boxed],
	parameters: prose({
		en: `
A custom command, written without a dictionary: its texts are spelled out
where they are used. \`help\` reads the description as it stands — the shell
opens on \`help ping\` to show it. A \`dict\` only becomes useful once the same
command has to speak more than one language.
`,
		fr: `
Une commande à soi, écrite sans dictionnaire : ses textes sont écrits là où
ils servent. \`help\` lit la description telle quelle — le shell ouvre sur
\`help ping\` pour la montrer. Un \`dict\` ne devient utile que le jour où la
même commande doit parler plus d'une langue.
`,
	}),
}

export default meta

/** a custom command is added to the object, the rest stays put */
export const CustomCommands: StoryObj<typeof ShellProvider> = {
	name: "Custom commands",
	render: inProvider,
	parameters: source(`
import { Shell, ShellProvider, baseCommands, test, themes } from "flower-shell"
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

// the command is added to the object, the rest stays put.
// help ping opens the shell on what the help block above produces.
<ShellProvider
	commands={{ ...baseCommands, test, ping }}
	themes={themes}
	initialCommands={["help ping"]}
>
	<Shell />
</ShellProvider>
`),
	args: {
		commands: { ...baseCommands, test, ping },
		themes,
		initialCommands: ["help ping"],
	},
}
