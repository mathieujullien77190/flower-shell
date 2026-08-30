import type { Meta, StoryObj } from "@storybook/react-vite"

import { renderOnly } from "../source"
import { ThemeBuilder } from "./ThemeBuilder"

/**
 * Pick a theme to start from, move the colours, and read the result twice:
 * once as a shell, once as the code that produces it. The block at the
 * bottom is a real `theme` prop — copy it into your own `<Shell />`.
 *
 * The preview is the real thing: a `Shell` in a `Window`, wearing the
 * draft, opening on `test` — the command that prints every colour of the
 * theme. Both palettes are live, the terminal one and the window frame one.
 *
 * It remounts at every touch of a picker: a shell already mounted would not
 * replay its opening, and the theme lives at module level. Animation is off
 * here alone, so the palette lands with the colour and not a second later.
 */
const meta: Meta<typeof ThemeBuilder> = {
	title: "Shell/Theme builder",
	component: ThemeBuilder,
}

export default meta

export const ThemeBuilderStory: StoryObj<typeof ThemeBuilder> = {
	name: "Theme builder",
	parameters: renderOnly,
	render: () => <ThemeBuilder />,
}
