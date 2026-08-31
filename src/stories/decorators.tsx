import { createContext, useContext, useRef, useState } from "react"
import type { Decorator } from "@storybook/react-vite"

import { Shell } from "../Shell"
import { ShellProvider } from "../state/context"
import type { ShellProviderProps } from "../state/context"
import { setThemes, wearTheme } from "../theme"

/**
 * The theme and its catalogue live at module level, shared by every shell:
 * without a reset they would leak from one story to the next — Themes
 * mounts three of them. Back to nothing mounted and nothing worn, which is
 * what a shell with no theme prop is; each story declares its own on mount.
 *
 * The history needs nothing here: each provider owns its values, so a new
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

/** the box a story scrolls, handed to the shell that sits in it */
const ScrollBox = createContext<React.RefObject<HTMLDivElement | null> | null>(
	null
)

/**
 * The box that holds the shell: smaller than the page, bordered, and above
 * all scrollable. Its ref goes to `scrollRef`, which lets the shell scroll it
 * down as the output grows — without it, anything overflowing would stay out
 * of reach.
 */
export const Boxed = ({ children }: { children: React.ReactNode }) => {
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
					<ScrollBox.Provider value={box}>{children}</ScrollBox.Provider>
				</div>
			</div>
		</Fresh>
	)
}

/**
 * The shell of a boxed story: it takes the ref of the box around it. A
 * consumer writes `<Shell scrollRef={box} />` and holds the ref themselves —
 * here the decorator owns the box, so it hands it down.
 */
export const BoxedShell = () => (
	<Shell scrollRef={useContext(ScrollBox) ?? undefined} />
)

/**
 * What most stories render: the props under test on the provider, and the
 * screen inside it. It is the shape of the snippets, minus the box.
 */
export const inProvider = (args: Omit<ShellProviderProps, "children">) => (
	<ShellProvider {...args}>
		<BoxedShell />
	</ShellProvider>
)

/** the shell in its box, its theme reset before each story */
export const boxed: Decorator = Story => (
	<Boxed>
		<Story />
	</Boxed>
)

/** the reset alone, for a story that lays out its own frame */
export const fresh: Decorator = Story => (
	<Fresh>
		<Story />
	</Fresh>
)
