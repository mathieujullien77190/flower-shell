import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Declare `manager.ts` a la main.
 *
 * Storybook le cherche tout seul — `resolveModulePath("./manager", { from:
 * configDir })` — mais sur Windows il lui passe un chemin a antislashs, que
 * le resolveur prend pour des sequences d'echappement : `\p`, `\f` et le
 * reste disparaissent, la resolution echoue, et le `catch {}` qui l'entoure
 * n'en dit rien. Le fichier est donc ignore sans un mot.
 *
 * Le chemin part d'ici en slashs, seule forme que le resolveur traverse
 * sans l'abimer.
 */
const here = dirname(fileURLToPath(import.meta.url)).replace(/\\/g, "/")
const entry = join(here, "manager.ts").replace(/\\/g, "/")

export const managerEntries = (entries: string[] = []) => [...entries, entry]
