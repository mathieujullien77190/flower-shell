import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { boxed } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

const meta: Meta<typeof Shell> = {
	title: "Shell/Default",
	component: Shell,
	decorators: [boxed],
	parameters: prose({
		en: `
A bare shell: \`commands\` is optional, so \`<Shell />\` mounts on its own. With
an empty registry nothing answers — and nothing complains either. A typed line
simply moves on to the next one.
`,
		fr: `
Un shell nu : \`commands\` est facultative, donc \`<Shell />\` se monte tout
seul. Le registre vide, rien ne répond — et rien ne proteste non plus. Une
ligne tapée passe simplement à la suivante.
`,
	}),
}

export default meta

export const Default: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell } from "flower-shell"

<Shell />
`),
}
