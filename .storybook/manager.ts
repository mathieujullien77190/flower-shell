import { addons } from "storybook/manager-api"
import { themes } from "storybook/theming"

/**
 * The theme of the manager — the sidebar, the toolbar, the frame.
 *
 * It can only be set from here: `preview.tsx` cannot reach it, the two live
 * in different documents. What they share are the globals, and the channel
 * announces them.
 *
 * Without React, deliberately: an `import ... from "react"` in a manager
 * entry makes its esbuild bundle fail, without a word, and the whole file
 * stops being taken into account. The channel is enough on its own.
 */
const pick = (name: unknown) => (name === "dark" ? themes.dark : themes.light)

// light from the moment it loads, whatever the preference of the system
addons.setConfig({ theme: pick("light") })

addons.register("flower-shell/theme", () => {
	addons
		.getChannel()
		.on("globalsUpdated", ({ globals }: { globals?: { theme?: unknown } }) => {
			addons.setConfig({ theme: pick(globals?.theme) })
		})
})
