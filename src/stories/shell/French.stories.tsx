import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { dictEn } from "../../i18n/en"
import { dictFr } from "../../i18n/fr"
import { boxed } from "../decorators"
import { source } from "../source"

/**
 * French: the package ships it, you only need to mount it. The shell's
 * languages are the keys of `dict` — here both, so `lang fr` and `lang en`
 * both respond. The shell opens on `help lang`, which lists exactly those.
 */
const meta: Meta<typeof Shell> = {
	title: "Shell/French",
	component: Shell,
	decorators: [boxed],
}

export default meta

export const French: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands, test, dictEn, dictFr } from "flower-shell"

// the shell's languages are the keys of dict, so both answer:
// lang fr and lang en. help lang lists exactly those.
<Shell
	commands={{ ...baseCommands, test }}
	lang="fr"
	dict={{ en: dictEn, fr: dictFr }}
	initialCommands={["help lang"]}
/>
`),
	args: {
		commands: { ...baseCommands, test },
		lang: "fr",
		dict: { en: dictEn, fr: dictFr },
		initialCommands: ["help lang"],
	},
}
