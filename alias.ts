import path from "node:path"

const r = (p: string) => path.resolve(process.cwd(), p)

// Roots of `src` exposed as aliases. Shared by Storybook (vite.config) and
// the publishing build (vite.lib.config) — the same point of truth as the
// `paths` of tsconfig.json. `process.cwd()` (and not import.meta.url)
// because Vite recompiles its configs in a temporary folder.
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
