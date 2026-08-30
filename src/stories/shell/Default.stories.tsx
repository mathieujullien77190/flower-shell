import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { flowerTheme } from "../../theme"
import { boxed } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

const meta: Meta<typeof Shell> = {
	title: "Shell/Default",
	component: Shell,
	decorators: [boxed],
	parameters: prose({
		en: `
The smallest shell that can be written: \`themes\` is the only prop it asks
for, and one theme is enough. \`commands\` is optional, so the registry is
empty — nothing answers, and nothing complains either. A typed line simply
moves on to the next one.
`,
		fr: `
Le plus petit shell qu'on puisse écrire : \`themes\` est la seule prop qu'il
réclame, et un thème suffit. \`commands\` est facultative, donc le registre est
vide — rien ne répond, et rien ne proteste non plus. Une ligne tapée passe
simplement à la suivante.
`,
	}),
}

export default meta

export const Default: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, flowerTheme } from "flower-shell"

<Shell themes={{ flower: flowerTheme }} />
`),
	args: {
		themes: { flower: flowerTheme },
	},
}
