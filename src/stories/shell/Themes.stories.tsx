import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { flowerTheme, nordTheme } from "../../theme"
import type { ShellThemeInput } from "../../theme"
import { boxed } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

/**
 * Written from scratch: only the colours and the prompt. What a theme does
 * not say keeps the value of `defaultTheme` — the window frame and the
 * fonts, here.
 */
const neon: ShellThemeInput = {
	colors: {
		background: "#0B0F1A",
		textColor: "#C8F7FF",
		importantColor: "#FF2E88",
		cmdColor: "#3BF0FF",
		restrictedColor: "#FFD166",
		infoColor: "#A78BFA",
		appColor: "#3BF0FF",
		invisible: "#0B0F1A",
	},
	prompt: "λ",
}

const meta: Meta<typeof Shell> = {
	title: "Shell/Themes",
	component: Shell,
	decorators: [boxed],
	parameters: prose({
		en: `
\`themes\` is the catalogue the visitor can reach: exactly what \`theme <name>\`
accepts and what \`help theme\` lists. Three of them here, one of each kind —
\`flower\`, the package default; \`nord\`, another one taken from the package;
and \`neon\`, written from scratch in the story file.

The shell opens on \`help theme\`, so the list is the first thing you read.
Then try \`theme neon\`, \`theme nord\`, \`theme flower\` — and \`theme dracula\`,
which is refused: the package ships it, this shell did not mount it.
`,
		fr: `
\`themes\` est le catalogue que le visiteur peut atteindre : exactement ce que
\`theme <nom>\` accepte et ce que \`help theme\` liste. Trois ici, un de chaque
sorte — \`flower\`, le thème du paquet ; \`nord\`, un autre pris au paquet ; et
\`neon\`, écrit de toutes pièces dans le fichier de la story.

Le shell ouvre sur \`help theme\`, la liste est donc la première chose qu'on
lit. Essayez ensuite \`theme neon\`, \`theme nord\`, \`theme flower\` — puis
\`theme dracula\`, qui est refusé : le paquet le livre, ce shell ne l'a pas
monté.
`,
	}),
}

export default meta

export const Themes: StoryObj<typeof Shell> = {
	parameters: source(`
import { Shell, baseCommands, test, flowerTheme, nordTheme, themes } from "flower-shell"
import type { ShellThemeInput } from "flower-shell"

// written from scratch: what it does not say keeps the default —
// the window frame and the fonts, here
const neon: ShellThemeInput = {
	colors: {
		background: "#0B0F1A",
		textColor: "#C8F7FF",
		importantColor: "#FF2E88",
		cmdColor: "#3BF0FF",
		restrictedColor: "#FFD166",
		infoColor: "#A78BFA",
		appColor: "#3BF0FF",
		invisible: "#0B0F1A",
	},
	prompt: "λ",
}

// the catalogue the visitor can reach, and nothing else: the five other
// themes of the package are not mounted, so \`theme dracula\` is refused.
// each name describes itself through the \`theme.<name>\` key.
<Shell
	commands={{ ...baseCommands, test }}
	themes={{ flower: flowerTheme, nord: nordTheme, neon }}
	theme="flower"
	initialCommands={["title", "help theme"]}
	dict={{ en: { theme: { neon: "Written from scratch, in the story file" } } }}
/>

// or hand over the whole catalogue, and let the visitor have all eight
<Shell commands={baseCommands} themes={themes} />
`),
	args: {
		commands: { ...baseCommands, test },
		themes: { flower: flowerTheme, nord: nordTheme, neon },
		theme: "flower",
		initialCommands: ["title", "help theme"],
		dict: {
			en: { theme: { neon: "Written from scratch, in the story file" } },
		},
	},
}
