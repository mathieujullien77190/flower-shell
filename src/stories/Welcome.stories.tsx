import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../Shell"
import { baseCommands } from "../commands/base"
import { test } from "../commands/test"
import { themes } from "../theme"
import { boxed } from "./decorators"
import { prose } from "./i18n"
import { source } from "./source"

// La page ou l'on tombe en arrivant : le paquet en marche, pas sa liste de
// props. Elle est premiere dans le tri de `preview.tsx`, et c'est donc elle
// que sert le site publie.
//
// En commentaire de ligne, et non en bloc : un bloc au-dessus du meta fait
// injecter au plugin CSF ses propres `parameters`, qui recouvrent les
// notres — et la prose disparaitrait avec eux.
const meta: Meta<typeof Shell> = {
	title: "flower-shell",
	component: Shell,
	decorators: [boxed],
	parameters: prose({
		en: `
A retro terminal in React: a command engine, history, autocompletion, animated
ASCII rendering, and a window to put it in. No layout imposed.

**The terminal below is the real one.** Type \`help\` to see what it answers,
\`theme nord\` to dress it differently, \`test\` to print every color of the
theme it wears, \`flowers\` for no reason at all.

Everything else in the sidebar is one case at a time, and each shows the code
that produces it: **Shell** from the bare component to a windowed one,
**Markup** for the markers that color the output. The globe in the toolbar
reads these pages in French.
`,
		fr: `
Un terminal rétro en React : moteur de commandes, historique, autocomplétion,
rendu ASCII animé, et une fenêtre pour le poser. Aucune mise en page imposée.

**Le terminal ci-dessous est le vrai.** Tapez \`help\` pour voir ce qu'il
répond, \`theme nord\` pour l'habiller autrement, \`test\` pour afficher toutes
les couleurs du thème qu'il porte, \`flowers\` pour rien.

Le reste de la barre latérale prend un cas à la fois, et chacun montre le code
qui le produit : **Shell** du composant nu jusqu'à la fenêtre, **Markup** pour
les marqueurs qui colorent la sortie. Le globe de la barre d'outils lit ces
pages en français.
`,
	}),
}

export default meta

export const FlowerShell: StoryObj<typeof Shell> = {
	name: "flower-shell",
	parameters: source(`
import { Shell, baseCommands, test, themes } from "flower-shell"

// the whole catalogue to switch through, the opening played at startup
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
