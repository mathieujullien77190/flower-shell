```tsx
import { Shell, baseCommands, test, themes } from "flower-shell"
import type { BaseCommand } from "flower-shell"

// the texts are written where they are used: no dictionary, no keys.
// help reads the description as it stands.
const ping: BaseCommand = {
	restricted: false,
	action: ({ args }) => (args.length === 0 ? "pong!" : `pong ${args.join(" ")}`),
	help: {
		patterns: [{ pattern: "ping [text]", description: "answers pong" }],
	},
}

// the command is added to the object, the rest stays put.
// help ping opens the shell on what the help block above produces.
<Shell
	commands={{ ...baseCommands, test, ping }}
	themes={themes}
	initialCommands={["help ping"]}
/>
```
