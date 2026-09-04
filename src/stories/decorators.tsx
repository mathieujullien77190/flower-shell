import { useState } from "react"
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
 * The box that holds the shell: smaller than the page, and of a set height.
 * That height is all the shell needs — it scrolls itself inside whatever it
 * is given, and a box of no height would leave it growing with its output.
 */
export const Boxed = ({ children }: { children: React.ReactNode }) => (
	<Fresh>
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
	</Fresh>
)

/** the shell in its box, reset before each story */
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
