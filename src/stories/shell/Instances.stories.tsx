import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { ShellProvider, useShell } from "../../state/registry"
import { baseCommands } from "../../commands/base"
import { flowerTheme } from "../../theme"
import { dictEn } from "../../i18n/en"
import { dictFr } from "../../i18n/fr"
import { fresh } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

/**
 * One toolbar for both terminals: the id says which one a line goes to, and
 * it is read when the button is clicked, not when this renders.
 */
const Toolbar = () => {
	const shell = useShell()

	return (
		<div style={{ display: "flex", gap: 8, paddingBottom: 12 }}>
			<button onClick={() => shell.run("left", "hello")}>hello, left</button>
			<button onClick={() => shell.run("right", "flowers")}>
				flowers, right
			</button>
			<button onClick={() => shell.runRestricted("left", "title")}>
				title, left
			</button>
		</div>
	)
}

const Box = ({ children }: { children: React.ReactNode }) => (
	<div style={{ overflowY: "auto", minHeight: 0 }}>{children}</div>
)

const meta: Meta<typeof Shell> = {
	title: "Shell/Several terminals",
	component: Shell,
	decorators: [fresh],
	parameters: prose({
		en: `
Two shells on the same page, and nothing shared between them: two histories,
two cursors, two languages. Type in one and the other does not move; the left
one answers in English, the right one in French, out of the same \`dict\`.

**No id, no commanding.** A terminal is only reachable if it was named, which
is what \`id\` is for, and \`<ShellProvider>\` is where those names are looked
up. The toolbar above takes \`useShell()\` and aims: \`run("left", "hello")\`,
\`runRestricted("left", "title")\`, \`actions("right")\` for that shell's state.
A shell with no \`id\`, or with no provider above, simply cannot be reached —
and does not need to be.

**The theme is the exception.** It lives in a module, because the markup is
coloured by a function and not by a component, so a context could not reach
it: \`theme nord\` typed in one terminal repaints both. The language, the
history and the options are per shell; the palette is not.
`,
		fr: `
Deux shells sur la même page, et rien de commun entre eux : deux historiques,
deux curseurs, deux langues. Tapez dans l'un, l'autre ne bouge pas ; celui de
gauche répond en anglais, celui de droite en français, depuis le même
\`dict\`.

**Pas d'id, pas de pilotage.** Un terminal ne s'atteint que s'il a été nommé,
c'est à quoi sert \`id\`, et \`<ShellProvider>\` est l'endroit où ces noms se
retrouvent. La barre du haut prend \`useShell()\` et vise :
\`run("left", "hello")\`, \`runRestricted("left", "title")\`,
\`actions("right")\` pour l'état de celui-là. Un shell sans \`id\`, ou sans
provider au-dessus, ne peut pas être atteint — et n'a pas à l'être.

**Le thème est l'exception.** Il vit dans un module, parce que le balisage est
coloré par une fonction et non par un composant, et qu'un contexte ne
l'atteindrait pas : \`theme nord\` tapé dans un terminal repeint les deux. La
langue, l'historique et les options sont par shell ; la palette non.
`,
	}),
}

export default meta

export const SeveralTerminals: StoryObj<typeof Shell> = {
	name: "Several terminals",
	parameters: source(`
import { Shell, ShellProvider, useShell, baseCommands, flowerTheme, dictEn, dictFr } from "flower-shell"

// the id is read when the button is clicked, so the toolbar can render
// before the terminals it aims at
const Toolbar = () => {
	const shell = useShell()

	return (
		<>
			<button onClick={() => shell.run("left", "hello")}>hello, left</button>
			<button onClick={() => shell.run("right", "flowers")}>flowers, right</button>
		</>
	)
}

;<ShellProvider>
	<Toolbar />

	<Shell
		id="left"
		commands={baseCommands}
		themes={{ flower: flowerTheme }}
		dict={{ en: dictEn, fr: dictFr }}
		lang="en"
		initialCommands={["welcome"]}
	/>

	{/* same commands, same dictionaries, its own history and its own language */}
	<Shell
		id="right"
		commands={baseCommands}
		themes={{ flower: flowerTheme }}
		dict={{ en: dictEn, fr: dictFr }}
		lang="fr"
		initialCommands={["welcome"]}
	/>
</ShellProvider>
`),
	render: () => (
		<ShellProvider>
			<div
				style={{
					display: "grid",
					gridTemplateRows: "auto 1fr",
					height: "100vh",
					boxSizing: "border-box",
					padding: 24,
					font: "14px/1.6 system-ui, sans-serif",
				}}
			>
				<Toolbar />

				<div
					style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
				>
					<Box>
						<Shell
							id="left"
							commands={baseCommands}
							themes={{ flower: flowerTheme }}
							dict={{ en: dictEn, fr: dictFr }}
							lang="en"
							initialCommands={["welcome"]}
						/>
					</Box>

					<Box>
						<Shell
							id="right"
							commands={baseCommands}
							themes={{ flower: flowerTheme }}
							dict={{ en: dictEn, fr: dictFr }}
							lang="fr"
							initialCommands={["welcome"]}
						/>
					</Box>
				</div>
			</div>
		</ShellProvider>
	),
}
