import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { ShellProvider, useShell } from "../../state/registry"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { themes } from "../../theme"
import { dictEn } from "../../i18n/en"
import { dictFr } from "../../i18n/fr"
import { fresh } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

const TERMINAL = "terminal"

/** what a read of `actions(id)` gives back, frozen at the moment it was asked */
type Snapshot = { lang: string; animation: boolean; played: number }

const Remote = () => {
	const shell = useShell()
	const [line, setLine] = useState("help")
	const [seen, setSeen] = useState<Snapshot | null>(null)

	const read = () => {
		const state = shell.actions(TERMINAL)

		setSeen({
			lang: state.lang,
			animation: state.animation,
			played: state.commands.length,
		})
	}

	return (
		<div style={{ display: "grid", gap: 20, alignContent: "start" }}>
			<Group title="play a line">
				<form
					style={{ display: "flex", gap: 8 }}
					onSubmit={event => {
						event.preventDefault()
						shell.run(TERMINAL, line)
					}}
				>
					<input
						value={line}
						onChange={event => setLine(event.target.value)}
						style={{
							flex: 1,
							font: "13px/1.5 ui-monospace, monospace",
							padding: "6px 8px",
							border: "1px solid #000000",
							borderRadius: 4,
						}}
					/>
					<button type="submit">run</button>
				</form>

				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<button onClick={() => shell.run(TERMINAL, "flowers")}>
						flowers
					</button>
					<button onClick={() => shell.run(TERMINAL, "test")}>test</button>
					<button onClick={() => shell.run(TERMINAL, "nope")}>nope</button>
				</div>
			</Group>

			<Group title="restricted">
				{/* the visitor cannot type these: they only come from here */}
				<div style={{ display: "flex", gap: 8 }}>
					<button onClick={() => shell.runRestricted(TERMINAL, "title")}>
						title
					</button>
					<button onClick={() => shell.runRestricted(TERMINAL, "welcome")}>
						welcome
					</button>
				</div>
			</Group>

			<Group title="its state">
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<button onClick={() => shell.actions(TERMINAL).clear()}>clear</button>
					<button onClick={() => shell.actions(TERMINAL).reset()}>reset</button>
					<button onClick={() => shell.actions(TERMINAL).setLang("fr")}>
						lang fr
					</button>
					<button onClick={() => shell.actions(TERMINAL).setLang("en")}>
						lang en
					</button>
					<button onClick={() => shell.actions(TERMINAL).setAnimation(false)}>
						animation off
					</button>
				</div>
			</Group>

			<Group title="read it back">
				<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
					<button onClick={read}>read</button>
					<code style={{ opacity: 0.7, font: "12px ui-monospace, monospace" }}>
						{seen
							? `lang ${seen.lang} · animation ${seen.animation ? "on" : "off"} · ${seen.played} played`
							: "nothing read yet"}
					</code>
				</div>
			</Group>
		</div>
	)
}

const Group = ({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) => (
	<section style={{ display: "grid", gap: 8 }}>
		<h3
			style={{
				margin: 0,
				font: "600 11px/1.4 ui-monospace, monospace",
				letterSpacing: "0.1em",
				textTransform: "uppercase",
				opacity: 0.6,
			}}
		>
			{title}
		</h3>
		{children}
	</section>
)

const meta: Meta<typeof Shell> = {
	title: "Shell/Remote control",
	component: Shell,
	decorators: [fresh],
	parameters: prose({
		en: `
One terminal, and a panel that drives it from outside. The panel is not in the
shell and knows nothing about it: it sits under the same \`<ShellProvider>\`,
takes \`useShell()\`, and names the terminal it aims at.

\`run\` sends a line as if it had been typed — try \`nope\`, which the shell
turns down like any other bad line. \`runRestricted\` sends what the visitor
cannot: \`title\` and \`welcome\` are the opening, replayable at will. And
\`actions(id)\` is the state itself, setters included — \`clear\`, \`reset\`,
\`setLang\`, \`setAnimation\`.

**The panel does not follow the terminal.** \`actions(id)\` reads fresh when it
is called, but nothing here subscribes to anything: the read-out shows what
the state was when you pressed *read*, not what it is now. Type a line in the
terminal and press *read* again to see it move. A panel that had to stay in
step would keep its own copy, or live inside the shell rather than beside it.
`,
		fr: `
Un terminal, et un panneau qui le pilote de l'extérieur. Le panneau n'est pas
dans le shell et ne sait rien de lui : il est sous le même
\`<ShellProvider>\`, prend \`useShell()\`, et nomme le terminal qu'il vise.

\`run\` envoie une ligne comme si elle avait été tapée — essayez \`nope\`, que
le shell refuse comme n'importe quelle mauvaise ligne. \`runRestricted\` envoie
ce que le visiteur ne peut pas : \`title\` et \`welcome\` sont l'ouverture,
rejouables à volonté. Et \`actions(id)\` est l'état lui-même, setters compris —
\`clear\`, \`reset\`, \`setLang\`, \`setAnimation\`.

**Le panneau ne suit pas le terminal.** \`actions(id)\` relit au moment de
l'appel, mais rien ici ne s'abonne à quoi que ce soit : l'affichage montre ce
qu'était l'état quand vous avez appuyé sur *read*, pas ce qu'il est. Tapez une
ligne dans le terminal et rappuyez sur *read* pour le voir bouger. Un panneau
qui devrait rester à jour garderait sa propre copie, ou vivrait dans le shell
plutôt qu'à côté.
`,
	}),
}

export default meta

export const RemoteControl: StoryObj<typeof Shell> = {
	name: "Remote control",
	parameters: source(`
import { useState } from "react"
import { Shell, ShellProvider, useShell, baseCommands, test, themes, dictEn, dictFr } from "flower-shell"

const TERMINAL = "terminal"

const Remote = () => {
	const shell = useShell()
	const [line, setLine] = useState("help")
	const [seen, setSeen] = useState(null)

	return (
		<>
			{/* a line, as if the visitor had typed it */}
			<button onClick={() => shell.run(TERMINAL, line)}>run</button>

			{/* what the visitor cannot type */}
			<button onClick={() => shell.runRestricted(TERMINAL, "title")}>title</button>

			{/* the state, setters included */}
			<button onClick={() => shell.actions(TERMINAL).clear()}>clear</button>
			<button onClick={() => shell.actions(TERMINAL).setLang("fr")}>lang fr</button>

			{/* read fresh, and only when asked: nothing subscribes here */}
			<button onClick={() => setSeen(shell.actions(TERMINAL).lang)}>read</button>
			<code>{seen}</code>
		</>
	)
}

;<ShellProvider>
	<Remote />

	<Shell
		id={TERMINAL}
		commands={{ ...baseCommands, test }}
		themes={themes}
		dict={{ en: dictEn, fr: dictFr }}
		initialCommands={["title", "welcome"]}
	/>
</ShellProvider>
`),
	render: () => (
		<ShellProvider>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "minmax(260px, 320px) 1fr",
					gap: 24,
					height: "100vh",
					boxSizing: "border-box",
					padding: 24,
					font: "14px/1.6 system-ui, sans-serif",
				}}
			>
				<Remote />

				<div
					style={{
						overflowY: "auto",
						minHeight: 0,
						border: "solid 2px #000000",
						borderRadius: 4,
					}}
				>
					<Shell
						id={TERMINAL}
						commands={{ ...baseCommands, test }}
						themes={themes}
						dict={{ en: dictEn, fr: dictFr }}
						initialCommands={["title", "welcome"]}
					/>
				</div>
			</div>
		</ShellProvider>
	),
}
