import type { Decorator } from "@storybook/react-vite"

/**
 * The box that holds the shell: smaller than the page, and of a set height.
 * That height is all the shell needs — it scrolls itself inside whatever it
 * is given, and a box of no height would leave it growing with its output.
 *
 * Nothing is reset between two stories: a `<Shell>` carries its own
 * catalogue, its own theme and its own dictionaries, so a story that mounts
 * three of them leaves nothing behind for the next one.
 */
export const Boxed = ({ children }: { children: React.ReactNode }) => (
	<div
		style={{
			height: "100vh",
			boxSizing: "border-box",
			padding: 32,
			backgroundColor: "#f8f8f8",
		}}
	>
		{children}
	</div>
)

/** the shell in its box */
export const boxed: Decorator = Story => (
	<Boxed>
		<Story />
	</Boxed>
)
