import { useCallback, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../../Shell"
import { baseCommands } from "../../../commands/base"
import { testCommand as test } from "../../../commands/common/test"
import { themes } from "../../../theme"
import type { BaseCommand } from "../../../types"
import type { CommandErrorEvent, CommandEvent } from "../../../engine/send"
import { fresh } from "../../decorators"
import { prose, useLocale, type Labels } from "../../i18n"
import { source } from "../../source"
import en from "./Events.en.md?raw"
import fr from "./Events.fr.md?raw"
import eventsCode from "./Events.source.md?raw"

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

/**
 * What the panel says, in the language of the page. The four moments keep
 * the name of their prop in a tooltip: the column is read, the callback is
 * called, and only one of the two translates.
 */
const LABELS: Labels<{
	console: string
	command: string
	start: string
	done: string
	shown: string
	nothing: string
}> = {
	en: {
		console:
			"Every event is logged in full to the browser console — open it to read the arguments and the whole line.",
		command: "command",
		start: "start",
		done: "done",
		shown: "shown",
		nothing: "nothing yet",
	},
	fr: {
		console:
			"Chaque événement est journalisé en entier dans la console du navigateur — ouvrez-la pour lire les arguments et la ligne complète.",
		command: "commande",
		start: "départ",
		done: "jouée",
		shown: "affichée",
		nothing: "rien encore",
	},
}

const Watcher = () => {
	const label = LABELS[useLocale()]

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
			<div style={{ flex: 1 }}>
				<Shell
					commands={{ ...baseCommands, test, boom }}
					themes={themes}
					initialCommands={["title", "welcome"]}
					onCommandStart={start}
					onCommandDone={done}
					onCommandRendered={rendered}
					onCommandError={failed}
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
				<p style={{ margin: "0 0 12px", opacity: 0.75 }}>{label.console}</p>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "1fr auto auto auto",
						gap: "0 10px",
						alignItems: "center",
					}}
				>
					<strong>{label.command}</strong>
					<strong title="onCommandStart">{label.start}</strong>
					<strong title="onCommandDone">{label.done}</strong>
					<strong title="onCommandRendered">{label.shown}</strong>

					{seen.map((row, index) => (
						<Row key={`${index}-${row.name}`} row={row} />
					))}
				</div>

				{seen.length === 0 && <p style={{ opacity: 0.55 }}>{label.nothing}</p>}
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
	parameters: prose({ en, fr }),
}

export default meta

export const Events: StoryObj<typeof Shell> = {
	parameters: source(eventsCode),
	render: () => <Watcher />,
}
