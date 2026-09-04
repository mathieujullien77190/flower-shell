```tsx
import { useState } from "react"
import {
	Shell,
	ShellProvider,
	useShell,
	baseCommands,
	test,
	themes,
	dictEn,
	dictFr,
} from "flower-shell"

const TERMINAL = "terminal"

const Remote = () => {
	const shell = useShell()
	const [line, setLine] = useState("help")
	const [seen, setSeen] = useState(null)

	// read fresh, and only when asked: nothing subscribes here
	const read = () => {
		const state = shell.actions(TERMINAL)

		setSeen({
			lang: state.lang,
			animation: state.animation,
			played: state.commands.length,
		})
	}

	return (
		<>
			{/* a line, as if the visitor had typed it */}
			<form
				onSubmit={event => {
					event.preventDefault()
					shell.run(TERMINAL, line)
				}}
			>
				<input value={line} onChange={event => setLine(event.target.value)} />
				<button type="submit">run</button>
			</form>

			<button onClick={() => shell.run(TERMINAL, "flowers")}>flowers</button>
			<button onClick={() => shell.run(TERMINAL, "test")}>test</button>
			<button onClick={() => shell.run(TERMINAL, "nope")}>nope</button>

			{/* the visitor cannot type these: they only come from here */}
			<button onClick={() => shell.runRestricted(TERMINAL, "title")}>
				title
			</button>
			<button onClick={() => shell.runRestricted(TERMINAL, "welcome")}>
				welcome
			</button>

			{/* the state, setters included */}
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

			<button onClick={read}>read</button>
			<code>
				{seen &&
					`lang ${seen.lang} · animation ${seen.animation ? "on" : "off"} · ${seen.played} played`}
			</code>
		</>
	)
}

const App = () => (
	<ShellProvider>
		<Remote />

		<Shell
			id={TERMINAL}
			commands={{ ...baseCommands, test }}
			themes={themes}
			dict={{ en: dictEn, fr: dictFr }}
			initialCommands={["title", "welcome"]}
		/>
	</ShellProvider>
)
```
