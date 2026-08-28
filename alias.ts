import path from "node:path"

const r = (p: string) => path.resolve(process.cwd(), p)

// Racines de `src` exposees en alias. Partage par Storybook (vite.config) et
// le build de publication (vite.lib.config) — meme point de verite que les
// `paths` de tsconfig.json. `process.cwd()` (et non import.meta.url) car Vite
// recompile ses configs dans un dossier temporaire.
export const alias = {
	"@commands": r("src/commands"),
	"@engine": r("src/engine"),
	"@i18n": r("src/i18n"),
	"@render": r("src/render"),
	"@state": r("src/state"),
	"@window": r("src/window"),
	"@theme": r("src/theme"),
	"@types": r("src/types"),
}
