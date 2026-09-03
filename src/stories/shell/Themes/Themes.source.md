```tsx
import { Shell, baseCommands, test, flowerTheme, lavenderTheme, themes } from "flower-shell"
import type { ShellThemeInput } from "flower-shell"

// written from scratch: what it does not say keeps the default —
// the font and the box it is served in, here
const neon: ShellThemeInput = {
	colors: {
		background: "#0B0F1A",
		textColor: "#C8F7FF",
		importantColor: "#FF2E88",
		cmdColor: "#3BF0FF",
		restrictedColor: "#FFD166",
		infoColor: "#A78BFA",
		appColor: "#3BF0FF",
		invisible: "#0B0F1A",
	},
	prompt: "λ",
}

// the catalogue the visitor can reach, and nothing else: the five other
// themes of the package are not mounted, so `theme maple` is refused.
// each name describes itself through the `theme.<name>` key.
<Shell
	commands={{ ...baseCommands, test }}
	themes={{ flower: flowerTheme, lavender: lavenderTheme, neon }}
	theme="lavender"
	initialCommands={["title", "help theme"]}
	dict={{ en: { theme: { neon: "Written from scratch, in the story file" } } }}
/>

// or hand over the whole catalogue, and let the visitor have all seven
<Shell commands={baseCommands} themes={themes} />
```
