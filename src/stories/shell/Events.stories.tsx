import { useCallback, useRef, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { ShellProvider } from "../../state/context"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { themes } from "../../theme"
import type { BaseCommand } from "../../types"
import type { CommandErrorEvent, CommandEvent } from "../../engine/send"
import { fresh } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

type Watched = {
	name: string
	args: string[]
	done: boolean
	rendered: boolean
	error: string | null
}

/** a command that fails on purpose, to reach the third reason */
const boom: BaseCommand = {
	restricted: false,
	action: () => {
		throw new Error("boom, as advertised")
	},
	help: { patterns: [{ pattern: "boom", description: "throws on purpose" }] },
}

/**
 * The mark lands on the last row still waiting for it: a name can be
 * played twice, and the rows are in the order the commands started.
 */
const mark = (
	list: Watched[],
	event: CommandEvent,
	key: "done" | "rendered"
): Watched[] => {
	const index = list.findLastIndex(row => row.name === event.name && !row[key])
	if (index === -1) return list

	return list.map((row, i) => (i === index ? { ...row, [key]: true } : row))
}

const Watcher = () => {
	const box = useRef<HTMLDivElement>(null)
	const [seen, setSeen] = useState<Watched[]>([])

	// useCallback, or the listeners would be reset on every render
	const start = useCallback((event: CommandEvent) => {
		// eslint-disable-next-line no-console
		console.log("[onCommandStart]", event)
		setSeen(list => [
			...list,
			{ ...event, done: false, rendered: false, error: null },
		])
	}, [])

	const done = useCallback((event: CommandEvent) => {
		// eslint-disable-next-line no-console
		console.log("[onCommandDone]", event)
		setSeen(list => mark(list, event, "done"))
	}, [])

	const rendered = useCallback((event: CommandEvent) => {
		// eslint-disable-next-line no-console
		console.log("[onCommandRendered]", event)
		setSeen(list => mark(list, event, "rendered"))
	}, [])

	const failed = useCallback((event: CommandErrorEvent) => {
		// eslint-disable-next-line no-console
		console.error("[onCommandError]", event)
		setSeen(list => {
			const index = list.findLastIndex(
				row => row.name === event.name && !row.error
			)
			if (index === -1) return list

			return list.map((row, i) =>
				i === index ? { ...row, error: event.reason } : row
			)
		})
	}, [])

	return (
		<div
			style={{
				display: "flex",
				gap: 16,
				height: "100vh",
				boxSizing: "border-box",
				padding: 32,
			}}
		>
			<div
				ref={box}
				style={{
					flex: 1,
					overflowY: "auto",
					border: "solid 2px #000000",
					borderRadius: 4,
					boxShadow: "3px 2px 4px #00000041",
				}}
			>
				<ShellProvider
					commands={{ ...baseCommands, test, boom }}
					themes={themes}
					initialCommands={["title", "welcome"]}
					onCommandStart={start}
					onCommandDone={done}
					onCommandRendered={rendered}
					onCommandError={failed}
				>
					<Shell scrollRef={box} />
				</ShellProvider>
			</div>

			<div
				style={{
					width: 340,
					overflowY: "auto",
					padding: 16,
					border: "solid 2px #000000",
					borderRadius: 4,
					fontFamily: "monospace",
					fontSize: 13,
					background: "#f7f7f5",
				}}
			>
				<p style={{ margin: "0 0 12px", opacity: 0.75 }}>
					Every event is logged in full to the browser console — open it to read
					the arguments and the whole line.
				</p>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr auto auto auto",
						gap: "0 10px",
						alignItems: "center",
					}}
				>
					<strong>command</strong>
					<strong title="onCommandStart">start</strong>
					<strong title="onCommandDone">done</strong>
					<strong title="onCommandRendered">shown</strong>

					{seen.map((row, index) => (
						<Row key={`${index}-${row.name}`} row={row} />
					))}
				</div>

				{seen.length === 0 && <p style={{ opacity: 0.55 }}>nothing yet</p>}
			</div>
		</div>
	)
}

const Cell = ({ on }: { on: boolean }) => (
	<span style={{ opacity: on ? 1 : 0.25, textAlign: "center" }}>
		{on ? "✓" : "–"}
	</span>
)

const Row = ({ row }: { row: Watched }) => (
	<>
		<span
			style={{
				borderTop: "solid 1px #00000018",
				padding: "6px 0",
				wordBreak: "break-word",
			}}
		>
			<strong>{row.name}</strong>{" "}
			<span style={{ opacity: 0.6 }}>{row.args.join(" ")}</span>
			{/* the reason, not a moment more: so it hangs off the name */}
			{row.error && (
				<span
					title="onCommandError"
					style={{
						marginLeft: 6,
						padding: "1px 5px",
						borderRadius: 3,
						fontSize: 11,
						background: "#c0392b",
						color: "#ffffff",
					}}
				>
					{row.error}
				</span>
			)}
		</span>
		<Cell on />
		<Cell on={row.done} />
		<Cell on={row.rendered} />
	</>
)

const meta: Meta<typeof Shell> = {
	title: "Shell/Events",
	component: Shell,
	decorators: [fresh],
	parameters: prose({
		en: `
Everything the shell hands back, and nothing else: the panel on the right is
written from the four event props alone, one row per command with a tick under
each moment it has reached.

**Open the browser console.** Every event is logged there in full, which is
where you see what the panel cannot show: each one carries the name, the
arguments, and \`pattern\` — the whole line as it was sent.

\`onCommandStart\` fires before anything runs, off that line — so it fires for
a command that does not exist too, which the others never do.
\`onCommandDone\` fires once the action has returned its text and the effect
has played: the command is over, but nothing is on screen yet.
\`onCommandRendered\` fires when the text has finished being written, which on
a long output is a good while later.

\`onCommandError\` fires instead of \`onCommandDone\` when the command did not
play, and says why through \`reason\`. Three lines to try, one for each: \`nope\`
is \`unknown\`, \`theme nope\` is \`args\` — the command exists, the argument does
not — and \`boom\` throws on purpose, which is \`thrown\` and carries the error
itself.
`,
		fr: `
Tout ce que le shell rend, et rien d'autre : le panneau de droite est écrit
avec les seules quatre props d'évènement, une ligne par commande, une coche
sous chaque moment qu'elle a atteint.

**Ouvrez la console du navigateur.** Chaque évènement y part en entier, et
c'est là qu'on voit ce que le panneau ne peut pas montrer : chacun porte le
nom, les arguments, et \`pattern\` — la ligne entière telle qu'elle a été
envoyée.

\`onCommandStart\` part avant que quoi que ce soit ne joue, lu sur cette ligne
— il part donc aussi pour une commande qui n'existe pas, ce que les autres ne
font jamais. \`onCommandDone\` part une fois que l'action a rendu son texte et
que l'effet a joué : la commande est faite, mais rien n'est encore à l'écran.
\`onCommandRendered\` part quand le texte a fini de s'écrire, ce qui sur une
sortie longue arrive bien plus tard.

\`onCommandError\` part à la place de \`onCommandDone\` quand la commande n'a pas
joué, et dit pourquoi par \`reason\`. Trois lignes à essayer, une par raison :
\`nope\` donne \`unknown\`, \`theme nope\` donne \`args\` — la commande existe,
l'argument non — et \`boom\` lève exprès, ce qui donne \`thrown\` et porte
l'erreur elle-même.
`,
	}),
}

export default meta

export const Events: StoryObj<typeof Shell> = {
	parameters: source(`
import { useCallback, useRef, useState } from "react"
import { Shell, ShellProvider, baseCommands, test, themes } from "flower-shell"

// a command that fails on purpose, to reach the third reason
const boom = {
	restricted: false,
	action: () => {
		throw new Error("boom, as advertised")
	},
	help: { patterns: [{ pattern: "boom", description: "throws on purpose" }] },
}

const Watcher = () => {
	const box = useRef(null)
	const [seen, setSeen] = useState([])

	// every event carries { name, args, pattern }: the whole line as sent
	const start = useCallback(event => {
		console.log("[onCommandStart]", event)
		setSeen(list => [...list, { ...event, done: false, rendered: false, error: null }])
	}, [])

	// the mark lands on the last row still waiting for it: a name can be
	// played twice, and the rows are in the order the commands started
	const mark = key => event =>
		setSeen(list => {
			const index = list.findLastIndex(row => row.name === event.name && !row[key])
			if (index === -1) return list

			return list.map((row, i) => (i === index ? { ...row, [key]: true } : row))
		})

	// reason is "unknown", "args" or "thrown" — the last one carries error
	const failed = useCallback(event => {
		console.error("[onCommandError]", event)
	}, [])

	return (
		<div style={{ display: "flex", gap: 16, height: "100vh" }}>
			<ShellProvider
				commands={{ ...baseCommands, test, boom }}
				themes={themes}
				initialCommands={["title", "welcome"]}
				onCommandStart={start}
				onCommandDone={useCallback(mark("done"), [])}
				onCommandRendered={useCallback(mark("rendered"), [])}
				onCommandError={failed}
			>
				{/* the events are set on the provider, the box on the screen */}
				<div ref={box} style={{ flex: 1, overflowY: "auto" }}>
					<Shell scrollRef={box} />
				</div>
			</ShellProvider>

			{/* one row per command, a tick under each moment it reached */}
			<div style={{ width: 340, overflowY: "auto" }}>{/* … */}</div>
		</div>
	)
}
`),
	render: () => <Watcher />,
}
