```tsx
import {
	Shell,
	ShellProvider,
	useShell,
	baseCommands,
	flowerTheme,
	dictEn,
	dictFr,
} from "flower-shell"

// the id is read when the button is clicked, so the toolbar can render
// before the terminals it aims at
const Toolbar = () => {
	const shell = useShell()

	return (
		<>
			<button onClick={() => shell.run("left", "hello")}>hello, left</button>
			<button onClick={() => shell.run("right", "flowers")}>
				flowers, right
			</button>

			{/* what the visitor cannot type, played into the left one */}
			<button onClick={() => shell.runRestricted("left", "title")}>
				title, left
			</button>
		</>
	)
}

const App = () => (
	<ShellProvider>
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
)
```
