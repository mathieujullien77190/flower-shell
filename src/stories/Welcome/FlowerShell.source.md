```tsx
import { Shell, baseCommands, test, themes } from "flower-shell"

// the whole catalogue to switch through, the opening played at startup
const App = () => (
	<Shell
		commands={{ ...baseCommands, test }}
		themes={themes}
		initialCommands={["title", "welcome"]}
	/>
)
```
