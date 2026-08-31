import { useRef } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import type { ShellHandle } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { flowerTheme } from "../../theme"
import { dictEn } from "../../i18n/en"
import { dictFr } from "../../i18n/fr"
import { fresh } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

const Pair = () => {
	const left = useRef<ShellHandle>(null)
	const right = useRef<ShellHandle>(null)

	return (
		<div
			style={{
				display: "grid",
				gridTemplateRows: "auto 1fr",
				gap: 12,
				height: "100vh",
				boxSizing: "border-box",
				padding: 24,
				font: "14px/1.6 system-ui, sans-serif",
			}}
		>
			<div style={{ display: "flex", gap: 8 }}>
				<button onClick={() => left.current?.run("hello")}>hello, left</button>
				<button onClick={() => right.current?.run("flowers")}>
					flowers, right
				</button>
				<button onClick={() => left.current?.runRestricted("title")}>
					title, left
				</button>
			</div>

			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
				<Box>
					<Shell
						ref={left}
						commands={baseCommands}
						themes={{ flower: flowerTheme }}
						dict={{ en: dictEn, fr: dictFr }}
						lang="en"
						initialCommands={["welcome"]}
					/>
				</Box>

				<Box>
					<Shell
						ref={right}
						commands={baseCommands}
						themes={{ flower: flowerTheme }}
						dict={{ en: dictEn, fr: dictFr }}
						lang="fr"
						initialCommands={["welcome"]}
					/>
				</Box>
			</div>
		</div>
	)
}

/** the box each terminal is served in: the story's layout, not the package's */
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
one answers in English, the right one in French, from the same \`dict\`.

Each is held through \`ref\`, and that handle is the only way in from outside
React: \`run\` plays a line as if it had been typed, \`runRestricted\` plays one
the visitor cannot type, \`actions()\` reads the state of that shell alone. The
buttons above do nothing else.

**The theme is the exception.** It lives in a module, because the markup is
coloured by a function and not by a component, so a provider could not reach
it: \`theme nord\` typed in one terminal repaints both. The language, the
history and the options are per shell; the palette is not.
`,
		fr: `
Deux shells sur la même page, et rien de commun entre eux : deux historiques,
deux curseurs, deux langues. Tapez dans l'un, l'autre ne bouge pas ; celui de
gauche répond en anglais, celui de droite en français, depuis le même
\`dict\`.

Chacun se tient par \`ref\`, et ce handle est la seule entrée depuis
l'extérieur de React : \`run\` joue une ligne comme si elle avait été tapée,
\`runRestricted\` en joue une que le visiteur ne peut pas taper, \`actions()\`
lit l'état de ce shell-là seulement. Les boutons du haut ne font rien d'autre.

**Le thème est l'exception.** Il vit dans un module, parce que le balisage est
coloré par une fonction et non par un composant, et qu'un provider ne
l'atteindrait pas : \`theme nord\` tapé dans un terminal repeint les deux. La
langue, l'historique et les options sont par shell ; la palette non.
`,
	}),
}

export default meta

export const SeveralTerminals: StoryObj<typeof Shell> = {
	name: "Several terminals",
	parameters: source(`
import { useRef } from "react"
import { Shell, baseCommands, flowerTheme, dictEn, dictFr } from "flower-shell"
import type { ShellHandle } from "flower-shell"

const Pair = () => {
	// one handle per terminal: it is what says which one a line goes to
	const left = useRef<ShellHandle>(null)
	const right = useRef<ShellHandle>(null)

	return (
		<>
			<button onClick={() => left.current?.run("hello")}>hello, left</button>
			<button onClick={() => right.current?.run("flowers")}>flowers, right</button>
			<button onClick={() => left.current?.runRestricted("title")}>title, left</button>

			<Shell
				ref={left}
				commands={baseCommands}
				themes={{ flower: flowerTheme }}
				dict={{ en: dictEn, fr: dictFr }}
				lang="en"
				initialCommands={["welcome"]}
			/>

			{/* same commands, same dictionaries, its own history and its own language */}
			<Shell
				ref={right}
				commands={baseCommands}
				themes={{ flower: flowerTheme }}
				dict={{ en: dictEn, fr: dictFr }}
				lang="fr"
				initialCommands={["welcome"]}
			/>
		</>
	)
}
`),
	render: () => <Pair />,
}
