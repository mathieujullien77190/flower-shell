import type { Decorator } from "@storybook/react-vite"

import { toolbarTone, type Tone } from "./tone"

/** the ground the box paints, on either side of the shell it holds */
const LIGHT = "#f8f8f8"
const DARK = "#151515"

/**
 * The box that holds the shell: smaller than the page, and of a set height.
 * That height is all the shell needs — it scrolls itself inside whatever it
 * is given, and a box of no height would leave it growing with its output.
 *
 * Its ground follows the theme of Storybook itself, the one picked in the
 * toolbar — not the theme of the terminal, which has its own props. A pale
 * box on a documentation read in the dark is a lamp in the middle of the
 * page; a dark one under a documentation read in the light hides the edge of
 * a dark terminal. The box belongs to the page around the shell, so it
 * follows the page.
 *
 * Nothing is reset between two stories: a `<Shell>` carries its own
 * catalogue, its own theme and its own dictionaries, so a story that mounts
 * three of them leaves nothing behind for the next one.
 */
export const Boxed = ({
	children,
	tone = "light",
}: {
	children: React.ReactNode
	tone?: Tone
}) => (
	<div
		style={{
			height: "100vh",
			boxSizing: "border-box",
			padding: 32,
			backgroundColor: tone === "dark" ? DARK : LIGHT,
		}}
	>
		{children}
	</div>
)

/** the shell in its box, on the ground of the documentation around it */
export const boxed: Decorator = (Story, context) => (
	<Boxed tone={toolbarTone(context.globals.theme)}>
		<Story />
	</Boxed>
)
