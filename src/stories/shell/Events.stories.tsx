import { useCallback, useRef, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { fresh } from "../decorators"
import { source } from "../source"

/**
 * Everything the shell hands back, and nothing else: the panel on the right
 * is written from the four event props alone, one row per command with a
 * tick under each moment it has reached.
 *
 * `onCommandStart` fires before anything runs, off the line as it was sent
 * — so it fires for a command that does not exist too, which the others
 * never do. `onCommandDone` fires once the action has returned its text and
 * the effect has played: the command is over, but nothing is on screen yet.
 * `onCommandRendered` fires when the text has finished being written, which
 * on a long output is a good while later.
 *
 * `onRestrictedCommand` is not a moment but a kind: it marks the commands
 * the visitor cannot type, played by the code — the opening here. It fires
 * alongside `onCommandDone`, which does not tell the two apart.
 *
 * Type `hello`, then `title` — the logo takes its time, and the gap between
 * the last two ticks is the animation. Then type something that does not
 * exist: only the first tick lands.
 */

type Watched = {
	name: string
	args: string[]
	done: boolean
	rendered: boolean
	restricted: boolean
}

const Watcher = () => {
	const box = useRef<HTMLDivElement>(null)
	const [seen, setSeen] = useState<Watched[]>([])

	// useCallback, or the listeners would be reset on every render
	const start = useCallback((name: string, args: string[]) => {
		setSeen(list => [
			...list,
			{ name, args, done: false, rendered: false, restricted: false },
		])
	}, [])

	/**
	 * The mark lands on the last row still waiting for it: a name can be
	 * played twice, and the rows are in the order the commands started.
	 */
	const mark = (key: "done" | "rendered" | "restricted") => (name: string) =>
		setSeen(list => {
			const index = list.findLastIndex(row => row.name === name && !row[key])
			if (index === -1) return list

			return list.map((row, i) => (i === index ? { ...row, [key]: true } : row))
		})

	const done = useCallback(mark("done"), [])
	const rendered = useCallback(mark("rendered"), [])
	const restricted = useCallback(mark("restricted"), [])

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
				<Shell
					commands={{ ...baseCommands, test }}
					initialCommands={["title", "welcome"]}
					scrollRef={box}
					onCommandStart={start}
					onCommandDone={done}
					onCommandRendered={rendered}
					onRestrictedCommand={restricted}
				/>
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
			{/* onRestrictedCommand : une sorte, pas un moment — elle tient donc
			    au nom et non a une colonne de plus */}
			{row.restricted && (
				<span
					title="onRestrictedCommand"
					style={{
						marginLeft: 6,
						padding: "1px 5px",
						borderRadius: 3,
						fontSize: 11,
						background: "#00000012",
						opacity: 0.7,
					}}
				>
					restricted
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
}

export default meta

export const Events: StoryObj<typeof Shell> = {
	parameters: source(`
import { useCallback, useRef, useState } from "react"
import { Shell, baseCommands, test } from "flower-shell"

const Watcher = () => {
	const box = useRef<HTMLDivElement>(null)
	const [seen, setSeen] = useState([])

	// useCallback, or the listeners would be reset on every render
	const start = useCallback((name, args) => {
		setSeen(list => [
			...list,
			{ name, args, done: false, rendered: false, restricted: false },
		])
	}, [])

	// the mark lands on the last row still waiting for it: a name can be
	// played twice, and the rows are in the order the commands started
	const mark = key => name =>
		setSeen(list => {
			const index = list.findLastIndex(row => row.name === name && !row[key])
			if (index === -1) return list

			return list.map((row, i) => (i === index ? { ...row, [key]: true } : row))
		})

	return (
		<div style={{ display: "flex", gap: 16, height: "100vh" }}>
			<div ref={box} style={{ flex: 1, overflowY: "auto" }}>
				<Shell
					commands={{ ...baseCommands, test }}
					initialCommands={["title", "welcome"]}
					scrollRef={box}
					// before anything runs — fires for an unknown command too
					onCommandStart={start}
					// the action returned its text, nothing is on screen yet
					onCommandDone={useCallback(mark("done"), [])}
					// the text has finished being written
					onCommandRendered={useCallback(mark("rendered"), [])}
					// played by the code, not typed — alongside onCommandDone
					onRestrictedCommand={useCallback(mark("restricted"), [])}
				/>
			</div>

			{/* one row per command, a tick under each moment it reached */}
			<div style={{ width: 340, overflowY: "auto" }}>{/* … */}</div>
		</div>
	)
}
`),
	render: () => <Watcher />,
}
