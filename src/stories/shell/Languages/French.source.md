```tsx
import {
	Shell,
	baseCommands,
	test,
	flowerTheme,
	dictEn,
	dictFr,
} from "flower-shell"

// the shell's languages are the keys of dict, so both answer:
// lang fr and lang en. help lang lists exactly those.
<Shell
	commands={{ ...baseCommands, test }}
	themes={{ flower: flowerTheme }}
	lang="fr"
	dict={{ en: dictEn, fr: dictFr }}
	initialCommands={["help lang"]}
/>
```
