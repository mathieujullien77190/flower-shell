import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { themes } from "../../theme"
import { boxed } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

const meta: Meta<typeof Shell> = {
	title: "Shell/Minimal",
	component: Shell,
	decorators: [boxed],
	parameters: prose({
		en: `
One step up from the bare shell: the commands shipped with the package, and
the usual opening — the logo, then the welcome message, chained through
\`initialCommands\`. This is the smallest shell that answers something, and the
shape most consumers start from.

Without a \`dict\` prop it only speaks English, and it wears \`flowerTheme\`, the
package default, flower on the prompt included.
`,
		fr: `
Un cran au-dessus du shell nu : les commandes du paquet, et l'ouverture
habituelle — le logo, puis le mot d'accueil, enchaînés par
\`initialCommands\`. C'est le plus petit shell qui réponde quelque chose, et la
forme dont partent la plupart des consommateurs.

Sans prop \`dict\` il ne parle qu'anglais, et il porte \`flowerTheme\`, le thème
du paquet, fleur sur l'invite comprise.
`,
	}),
}

export default meta

export const Minimal: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands, test, themes } from "flower-shell"

// title then welcome: the opening is a pair of commands like any other.
// welcome prints \`welcome.text\`, which the package already carries —
// override that key through \`dict\` to put your own words there.
// test rides along: it ships beside baseCommands, not inside it.
<Shell
	commands={{ ...baseCommands, test }}
	themes={themes}
	initialCommands={["title", "welcome"]}
/>
`),
	args: {
		commands: { ...baseCommands, test },
		themes,
		initialCommands: ["title", "welcome"],
	},
}
