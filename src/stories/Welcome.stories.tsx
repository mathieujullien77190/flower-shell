import type { Meta, StoryObj } from "@storybook/react-vite"

import { ShellProvider } from "../state/context"
import { baseCommands } from "../commands/base"
import { test } from "../commands/test"
import { themes } from "../theme"
import { boxed, inProvider } from "./decorators"
import { prose } from "./i18n"
import { source } from "./source"

// The page one lands on: the package running, not its list of props. It is
// first in the sort of `preview.tsx`, and so it is the one the published
// site serves.
//
// As line comments, and not as a block: a block above the meta makes the CSF
// plugin inject its own `parameters`, which cover ours — and the prose would
// disappear along with them.
const meta: Meta<typeof ShellProvider> = {
	title: "flower-shell",
	component: ShellProvider,
	decorators: [boxed],
	parameters: prose({
		en: `
A retro terminal in React: a command engine, history, autocompletion and
animated ASCII rendering. No layout imposed.

**The terminal below is the real one.** Type \`help\` to see what it answers,
\`theme nord\` to dress it differently, \`test\` to print every color of the
theme it wears, \`flowers\` for no reason at all.

Everything else in the sidebar is one case at a time, and each shows the code
that produces it: **Shell** from the bare component to the events it hands
back, **Markup** for the markers that color the output. The globe in the
toolbar reads these pages in French.
`,
		fr: `
Un terminal rétro en React : moteur de commandes, historique, autocomplétion
et rendu ASCII animé. Aucune mise en page imposée.

**Le terminal ci-dessous est le vrai.** Tapez \`help\` pour voir ce qu'il
répond, \`theme nord\` pour l'habiller autrement, \`test\` pour afficher toutes
les couleurs du thème qu'il porte, \`flowers\` pour rien.

Le reste de la barre latérale prend un cas à la fois, et chacun montre le code
qui le produit : **Shell** du composant nu jusqu'aux évènements qu'il rend,
**Markup** pour les marqueurs qui colorent la sortie. Le globe de la barre
d'outils lit ces pages en français.
`,
	}),
}

export default meta

export const FlowerShell: StoryObj<typeof ShellProvider> = {
	name: "flower-shell",
	render: inProvider,
	parameters: source(`
import { Shell, ShellProvider, baseCommands, test, themes } from "flower-shell"

// the whole catalogue to switch through, the opening played at startup
<ShellProvider
	commands={{ ...baseCommands, test }}
	themes={themes}
	initialCommands={["title", "welcome"]}
>
	<Shell />
</ShellProvider>
`),
	args: {
		commands: { ...baseCommands, test },
		themes,
		initialCommands: ["title", "welcome"],
	},
}
