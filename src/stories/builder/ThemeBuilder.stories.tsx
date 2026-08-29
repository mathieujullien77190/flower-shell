import type { Meta, StoryObj } from "@storybook/react-vite"

import { renderOnly } from "../source"
import { ThemeBuilder } from "./ThemeBuilder"

/**
 * Pick a theme to start from, move the colours, and read the result twice:
 * once as a shell, once as the code that produces it. The block at the
 * bottom is a real `theme` prop — copy it into your own `<Shell />`.
 *
 * The preview is a stand-in, not a live terminal: the shell keeps its theme
 * at module level and there is one per page, so a real one here would fight
 * the other stories for it. `highlight` is the same function either way, so
 * the colours you see are the colours you get.
 */
const meta: Meta<typeof ThemeBuilder> = {
	title: "Shell/Theme builder",
	component: ThemeBuilder,
}

export default meta

export const ThemeBuilderStory: StoryObj<typeof ThemeBuilder> = {
	name: "Theme builder",
	parameters: {
		...renderOnly,
		// il lui faut de la hauteur : deux colonnes, et le code en dessous
		docs: { ...renderOnly.docs, story: { inline: false, height: "820px" } },
	},
	render: () => <ThemeBuilder />,
}
