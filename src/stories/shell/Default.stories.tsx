import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { boxed } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

const meta: Meta<typeof Shell> = {
	title: "Shell/Default",
	component: Shell,
	decorators: [boxed],
	// the only page carrying the table of the props: it is the same
	// everywhere, and this is where one comes in
	parameters: prose(
		{
			en: `
\`<Shell />\`, with nothing at all. Every prop is optional, and what is left
out simply does not exist. The table below lists them all — it is on this page
alone, since it would say the same thing on every other.

No \`commands\`, so the registry is empty: nothing answers, and nothing
complains either — a typed line moves on to the next one. And no theme, so
nothing is painted: the shell takes the colors and the font of the page that
holds it, the prompt falls back to \`>\`, and the markup stops coloring. Pass
\`theme\`, or a \`themes\` catalogue to pick the first of, and it dresses up.
`,
			fr: `
\`<Shell />\`, sans rien du tout. Toutes les props sont facultatives, et ce
qu'on ne donne pas n'existe simplement pas. La table ci-dessous les liste
toutes — elle n'est que sur cette page, puisqu'elle dirait la même chose sur
toutes les autres.

Pas de \`commands\`, donc le registre est vide : rien ne répond, et rien ne
proteste non plus — une ligne tapée passe à la suivante. Et pas de thème, donc
rien n'est peint : le shell prend les couleurs et la police de la page qui le
tient, l'invite retombe sur \`>\`, et le balisage cesse de colorer. Donnez
\`theme\`, ou un catalogue \`themes\` dont il prendra le premier, et il
s'habille.
`,
		},
		{ controls: true }
	),
}

export default meta

export const Default: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell } from "flower-shell"

<Shell />
`),
}
