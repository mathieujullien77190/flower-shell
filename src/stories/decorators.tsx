import { useRef, useState } from "react"
import type { Decorator } from "@storybook/react-vite"

import { setThemes, wearTheme } from "../theme"
import { shellActions } from "../state/store"

/**
 * The shell state lives in a module: without this, one story's history would
 * carry into the next. The reset happens while the decorator renders, so
 * before the shell mounts and plays its opening.
 */
export const Fresh = ({ children }: { children: React.ReactNode }) => {
	useState(() => {
		shellActions().reset()
		// the theme and its catalogue live at module level: without a reset
		// they would leak from one story to the next — Themes mounts three of
		// them. Back to nothing mounted and nothing worn, which is what a
		// shell with no theme prop is; each story declares its own on mount.
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
						border: "solid 2px #000000",
						borderRadius: 4,
						boxShadow: "3px 2px 4px #00000041",
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
