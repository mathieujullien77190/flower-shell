import "styled-components"

import type { ShellTheme } from "./theme/types"

/**
 * The theme a styled-component of the shell reads off its props is the theme
 * of the package. Each terminal puts its own on a `ThemeProvider` of its
 * own, which is what lets two of them on the same page paint two palettes:
 * a styled-component renders inside the tree, where a context does reach.
 */
declare module "styled-components" {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	export interface DefaultTheme extends ShellTheme {}
}
