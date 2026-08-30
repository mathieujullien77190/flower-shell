import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { themes } from "../../theme"
import { dictEn } from "../../i18n/en"
import { dictFr } from "../../i18n/fr"
import { boxed } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

const meta: Meta<typeof Shell> = {
	title: "Shell/French",
	component: Shell,
	decorators: [boxed],
	parameters: prose({
		en: `
French: the package ships it, you only need to mount it. The shell's languages
are the keys of \`dict\` — here both, so \`lang fr\` and \`lang en\` both respond.
The shell opens on \`help lang\`, which lists exactly those.
`,
		fr: `
Le français : le paquet le livre, il n'y a qu'à le monter. Les langues du
shell sont les clés de \`dict\` — ici les deux, donc \`lang fr\` et \`lang en\`
répondent l'une comme l'autre. Le shell ouvre sur \`help lang\`, qui liste
exactement celles-là.
`,
	}),
}

export default meta

export const French: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands, test, themes, dictEn, dictFr } from "flower-shell"

// the shell's languages are the keys of dict, so both answer:
// lang fr and lang en. help lang lists exactly those.
<Shell
	commands={{ ...baseCommands, test }}
	themes={themes}
	lang="fr"
	dict={{ en: dictEn, fr: dictFr }}
	initialCommands={["help lang"]}
/>
`),
	args: {
		commands: { ...baseCommands, test },
		themes,
		lang: "fr",
		dict: { en: dictEn, fr: dictFr },
		initialCommands: ["help lang"],
	},
}
