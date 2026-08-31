import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { ShellProvider, useShell } from "../../state/context"
import { baseCommands } from "../../commands/base"
import { flowerTheme } from "../../theme"
import { dictEn } from "../../i18n/en"
import { dictFr } from "../../i18n/fr"
import { fresh } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

/**
 * A neighbour of the screen: it sits under the provider, so `useShell()` is
 * all it takes to play a line into that terminal — and into that one only.
 */
const Toolbar = () => {
	const shell = useShell()

	return (
		<div style={{ display: "flex", gap: 8, padding: "0 0 8px" }}>
			<button onClick={() => shell.run("hello")}>hello</button>
			<button onClick={() => shell.run("flowers")}>flowers</button>
			<button onClick={() => shell.runRestricted("title")}>title</button>
		</div>
	)
}

const Column = ({ lang }: { lang: string }) => (
	<ShellProvider
		commands={baseCommands}
		themes={{ flower: flowerTheme }}
		dict={{ en: dictEn, fr: dictFr }}
		lang={lang}
		initialCommands={["welcome"]}
	>
		<div
			style={{ display: "grid", gridTemplateRows: "auto 1fr", minHeight: 0 }}
		>
			<Toolbar />
			<div style={{ overflowY: "auto", minHeight: 0 }}>
				<Shell />
			</div>
		</div>
	</ShellProvider>
)

const meta: Meta<typeof ShellProvider> = {
	title: "Shell/Several terminals",
	component: ShellProvider,
	decorators: [fresh],
	parameters: prose({
		en: `
Two providers on the same page, and nothing shared between them: two
histories, two cursors, two languages. Type in one and the other does not
move; the left one answers in English, the right one in French, out of the
same \`dict\`.

Each toolbar sits under its own provider and takes \`useShell()\` — no ref, no
prop drilled down. \`run\` plays a line as if it had been typed,
\`runRestricted\` plays one the visitor cannot type, \`actions()\` reads the
state of that shell alone. Outside React, \`<Shell ref>\` hands back the same
three.

**The theme is the exception.** It lives in a module, because the markup is
coloured by a function and not by a component, so a provider could not reach
it: \`theme nord\` typed in one terminal repaints both. The language, the
history and the options are per shell; the palette is not.
`,
		fr: `
Deux providers sur la même page, et rien de commun entre eux : deux
historiques, deux curseurs, deux langues. Tapez dans l'un, l'autre ne bouge
pas ; celui de gauche répond en anglais, celui de droite en français, depuis
le même \`dict\`.

Chaque barre de boutons est sous son propre provider et prend \`useShell()\` —
pas de ref, pas de prop qu'on fait descendre. \`run\` joue une ligne comme si
elle avait été tapée, \`runRestricted\` en joue une que le visiteur ne peut pas
taper, \`actions()\` lit l'état de ce shell-là seulement. Hors de React,
\`<Shell ref>\` rend les trois mêmes.

**Le thème est l'exception.** Il vit dans un module, parce que le balisage est
coloré par une fonction et non par un composant, et qu'un provider ne
l'atteindrait pas : \`theme nord\` tapé dans un terminal repeint les deux. La
langue, l'historique et les options sont par shell ; la palette non.
`,
	}),
}

export default meta

export const SeveralTerminals: StoryObj<typeof ShellProvider> = {
	name: "Several terminals",
	parameters: source(`
import { Shell, ShellProvider, useShell, baseCommands, flowerTheme, dictEn, dictFr } from "flower-shell"

// under the provider, and that is enough to reach the terminal beside it
const Toolbar = () => {
	const shell = useShell()

	return (
		<>
			<button onClick={() => shell.run("hello")}>hello</button>
			<button onClick={() => shell.runRestricted("title")}>title</button>
		</>
	)
}

const Column = ({ lang }: { lang: string }) => (
	<ShellProvider
		commands={baseCommands}
		themes={{ flower: flowerTheme }}
		dict={{ en: dictEn, fr: dictFr }}
		lang={lang}
		initialCommands={["welcome"]}
	>
		<Toolbar />
		<Shell />
	</ShellProvider>
)

// two providers, two terminals, and nothing between them
<>
	<Column lang="en" />
	<Column lang="fr" />
</>
`),
	render: () => (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1fr",
				gap: 16,
				height: "100vh",
				boxSizing: "border-box",
				padding: 24,
				font: "14px/1.6 system-ui, sans-serif",
			}}
		>
			<Column lang="en" />
			<Column lang="fr" />
		</div>
	),
}
