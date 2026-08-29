import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { dictEn } from "../../i18n/en"
import { dictFr } from "../../i18n/fr"
import { boxed } from "../decorators"
import { source } from "../source"

/**
 * French: the package ships it, you only need to mount it. The shell's
 * languages are the keys of `dict` — here both, so `lang fr` and `lang en`
 * both respond.
 */
const meta: Meta<typeof Shell> = {
	title: "Shell/French",
	component: Shell,
	decorators: [boxed],
}

export default meta

export const French: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands, dictEn, dictFr } from "flower-shell"

// the shell's languages are the keys of dict, so both answer:
// lang fr and lang en
<Shell commands={baseCommands} lang="fr" dict={{ en: dictEn, fr: dictFr }} />
`),
	args: {
		commands: baseCommands,
		lang: "fr",
		dict: { en: dictEn, fr: dictFr },
	},
}
