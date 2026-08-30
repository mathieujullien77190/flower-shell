import type { Preview } from "@storybook/react-vite"

import { DocsPage } from "../src/stories/Docs"
import { LOCALES } from "../src/stories/i18n"

const preview: Preview = {
	// every story gets its docs page, where the Source block shows the code.
	// `!dev` drops the canvas entry from the sidebar: the docs page already
	// carries the render, the code and the props table.
	tags: ["autodocs", "!dev"],
	parameters: {
		// the shell takes all the room it is given
		layout: "fullscreen",
		options: {
			// Shell first: Markup documents the markers it renders, and reads
			// better once you have seen where they end up. Inside Shell, the two
			// smallest cases open the section — the bare terminal, then the same
			// with the package commands — the rest stays alphabetical, and the
			// theme builder closes it: it is a tool, not a case to read through.
			storySort: {
				order: ["Shell", ["Default", "Minimal", "*", "Theme builder"], "Markup"],
			},
		},
		docs: {
			// the package docs page: Storybook's own, save that it reads its
			// prose from the parameters and follows the language picked in the
			// toolbar. A comment above the meta could not do that — those are
			// extracted at build time.
			page: DocsPage,
			// the code as written in the file, not the JSX rebuilt from args
			source: { type: "code" },
			// the stories bound themselves on the window height: on a docs
			// page, that height has to be handed to them
			story: { inline: false, height: "420px" },
		},
	},
	/**
	 * The language of the documentation, picked in the toolbar. English by
	 * default: it is the language of the package, of its README and of its
	 * code. It does not touch the terminal, which has its own — a story can
	 * speak English inside a page read in French.
	 */
	globalTypes: {
		locale: {
			description: "Documentation language",
			toolbar: {
				title: "Docs",
				icon: "globe",
				items: [
					{ value: "en", title: "English" },
					{ value: "fr", title: "Français" },
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: { locale: LOCALES[0] },
}

export default preview
