import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Declares `manager.ts` by hand.
 *
 * Storybook looks for it on its own — `resolveModulePath("./manager", {
 * from: configDir })` — but on Windows it hands it a path with backslashes,
 * which the resolver takes for escape sequences: `\p`, `\f` and the rest
 * disappear, the resolution fails, and the `catch {}` around it says
 * nothing about it. So the file is ignored without a word.
 *
 * The path leaves here in slashes, the only form the resolver goes through
 * without damaging it.
 */
const here = dirname(fileURLToPath(import.meta.url)).replace(/\\/g, "/")
const entry = join(here, "manager.ts").replace(/\\/g, "/")

export const managerEntries = (entries: string[] = []) => [...entries, entry]
