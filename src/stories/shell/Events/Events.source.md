```tsx
import { useCallback, useState } from "react"
import { Shell, baseCommands, test, themes } from "flower-shell"
import type { BaseCommand, CommandEvent, CommandErrorEvent } from "flower-shell"

// a command that fails on purpose, to reach the third reason
const boom: BaseCommand = {
	restricted: false,
	action: () => {
		throw new Error("boom, as advertised")
	},
	help: { patterns: [{ pattern: "boom", description: "throws on purpose" }] },
}

// the mark lands on the last row still waiting for it: a name can be
// played twice, and the rows are in the order the commands started
const mark = (list, event, key) => {
	const index = list.findLastIndex(row => row.name === event.name && !row[key])
	if (index === -1) return list

	return list.map((row, i) => (i === index ? { ...row, [key]: true } : row))
}

const Watcher = () => {
	const [seen, setSeen] = useState([])

	// useCallback, or the listeners would be reset on every render
	const start = useCallback((event: CommandEvent) => {
		console.log("[onCommandStart]", event)
		setSeen(list => [
			...list,
			{ ...event, done: false, rendered: false, error: null },
		])
	}, [])

	// every event carries { name, args, pattern }: the whole line as sent
	const done = useCallback((event: CommandEvent) => {
		console.log("[onCommandDone]", event)
		setSeen(list => mark(list, event, "done"))
	}, [])

	const rendered = useCallback((event: CommandEvent) => {
		console.log("[onCommandRendered]", event)
		setSeen(list => mark(list, event, "rendered"))
	}, [])

	// reason is "unknown", "args" or "thrown" — the last one carries error
	const failed = useCallback((event: CommandErrorEvent) => {
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
		<div style={{ display: "flex", gap: 16, height: "100vh" }}>
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

			{/* one row per command, a tick under each moment it reached */}
			<div style={{ width: 340, overflowY: "auto" }}>{/* … */}</div>
		</div>
	)
}
```
