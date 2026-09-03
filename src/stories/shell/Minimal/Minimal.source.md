```tsx
import { Shell, baseCommands, test, themes } from "flower-shell"

// title then welcome: the opening is a pair of commands like any other.
// welcome prints `welcome.text`, which the package already carries —
// override that key through `dict` to put your own words there.
// test rides along: it ships beside baseCommands, not inside it.
<Shell
	commands={{ ...baseCommands, test }}
	themes={themes}
	initialCommands={["title", "welcome"]}
/>
```
