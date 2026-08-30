import { useCallback, useRef, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { fresh } from "../decorators"
import { source } from "../source"

/**
 * `onCommand` is the only thread out of the shell: it fires on every command
 * played, the package ones and the restricted ones included, with the name
 * and the arguments as they were parsed. The panel on the right is written
 * from that alone.
 *
 * Type anything — `help`, `theme nord`, `hello world`, a command that does
 * not exist — and watch the list. `clear` shows up in it like the rest: the
 * shell wipes the screen and nothing more, so what comes back after it is
 * yours to decide, from here.
 */

type Played = { name: string; args: string[] }

const Watched = () => {
	const box = useRef<HTMLDivElement>(null)
	const [played, setPlayed] = useState<Played[]>([])

	// useCallback, or the listener would be reset on every render
	const record = useCallback((name: string, args: string[]) => {
		setPlayed(list => [...list, { name, args }])
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
				<Shell
					commands={{ ...baseCommands, test }}
					initialCommands={["title", "welcome"]}
					scrollRef={box}
					onCommand={record}
				/>
			</div>

			<div
				style={{
					width: 280,
					overflowY: "auto",
					padding: 16,
					border: "solid 2px #000000",
					borderRadius: 4,
					fontFamily: "monospace",
					fontSize: 13,
					background: "#f7f7f5",
				}}
			>
				<strong>onCommand</strong>
				{played.length === 0 && <p style={{ opacity: 0.55 }}>nothing yet</p>}
				{played.map((command, index) => (
					<div
						key={`${index}-${command.name}`}
						style={{
							padding: "6px 0",
							borderTop: "solid 1px #00000018",
							wordBreak: "break-word",
						}}
					>
						<strong>{command.name}</strong>{" "}
						<span style={{ opacity: 0.6 }}>
							{command.args.length === 0 ? "—" : command.args.join(" ")}
						</span>
					</div>
				))}
			</div>
		</div>
	)
}

const meta: Meta<typeof Shell> = {
	title: "Shell/On command",
	component: Shell,
	decorators: [fresh],
}

export default meta

export const OnCommand: StoryObj<typeof Shell> = {
	name: "On command",
	parameters: source(`
import { useCallback, useRef, useState } from "react"
import { Shell, baseCommands, test } from "flower-shell"

type Played = { name: string; args: string[] }

const Watched = () => {
	const box = useRef<HTMLDivElement>(null)
	const [played, setPlayed] = useState<Played[]>([])

	// useCallback, or the listener would be reset on every render
	const record = useCallback((name: string, args: string[]) => {
		setPlayed(list => [...list, { name, args }])
	}, [])

	return (
		<div style={{ display: "flex", gap: 16, height: "100vh" }}>
			<div ref={box} style={{ flex: 1, overflowY: "auto" }}>
				<Shell
					commands={{ ...baseCommands, test }}
					initialCommands={["title", "welcome"]}
					scrollRef={box}
					onCommand={record}
				/>
			</div>

			{/* one div per command played, with its arguments */}
			<div style={{ width: 280, overflowY: "auto" }}>
				{played.map((command, index) => (
					<div key={\`\${index}-\${command.name}\`}>
						<strong>{command.name}</strong>{" "}
						<span>{command.args.join(" ") || "—"}</span>
					</div>
				))}
			</div>
		</div>
	)
}
`),
	render: () => <Watched />,
}
