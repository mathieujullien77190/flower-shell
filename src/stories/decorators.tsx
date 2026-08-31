import { useRef, useState } from "react"
import type { Decorator } from "@storybook/react-vite"

import { setThemes, wearTheme } from "../theme"

/**
 * The theme and its catalogue live at module level, shared by every shell:
 * without a reset they would leak from one story to the next — Themes
 * mounts three of them. Back to nothing mounted and nothing worn, which is
 * what a shell with no theme prop is; each story declares its own on mount.
 *
 * The history needs nothing here: each `<Shell>` owns its store, so a new
 * story is a new terminal.
 */
export const Fresh = ({ children }: { children: React.ReactNode }) => {
	useState(() => {
		setThemes()
		wearTheme()
		return true
	})

	return children
}

/**
 * The box that holds the shell: smaller than the page, bordered, and above
 * all scrollable. Its ref goes to scrollRef, which lets the shell scroll it
 * down as the output grows — without it, anything overflowing would stay out
 * of reach.
 */
export const Boxed = ({
	children,
}: {
	children: (box: React.RefObject<HTMLDivElement | null>) => React.ReactNode
}) => {
	const box = useRef<HTMLDivElement>(null)

	return (
		<Fresh>
			<div style={{ height: "100vh", boxSizing: "border-box", padding: 32 }}>
				<div
					ref={box}
					style={{
						height: "100%",
						overflowY: "auto",
					}}
				>
					{children(box)}
				</div>
			</div>
		</Fresh>
	)
}

/** the shell in its box, reset before each story, scrolled by its container */
export const boxed: Decorator = (Story, context) => (
	<Boxed>{box => <Story args={{ ...context.args, scrollRef: box }} />}</Boxed>
)

/** the reset alone, for a story that lays out its own frame */
export const fresh: Decorator = Story => (
	<Fresh>
		<Story />
	</Fresh>
)
