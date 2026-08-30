import { addons } from "storybook/manager-api"
import { themes } from "storybook/theming"

/**
 * Le theme du manager — la barre laterale, la barre d'outils, le cadre.
 *
 * Il ne se pose que d'ici : `preview.tsx` ne peut pas l'atteindre, les deux
 * vivent dans des documents differents. Ce qu'ils partagent, ce sont les
 * globals, et le canal les annonce.
 *
 * Sans React, volontairement : un `import ... from "react"` dans une entree
 * manager fait echouer son bundle esbuild, sans un mot, et le fichier
 * entier cesse d'etre pris en compte. Le canal se suffit a lui-meme.
 */
const pick = (name: unknown) => (name === "dark" ? themes.dark : themes.light)

// clair des le chargement, quelle que soit la preference du systeme
addons.setConfig({ theme: pick("light") })

addons.register("flower-shell/theme", () => {
	addons
		.getChannel()
		.on("globalsUpdated", ({ globals }: { globals?: { theme?: unknown } }) => {
			addons.setConfig({ theme: pick(globals?.theme) })
		})
})
