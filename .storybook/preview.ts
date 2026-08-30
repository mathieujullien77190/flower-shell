import type { Preview } from "@storybook/react-vite"

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
			// better once you have seen where they end up. Inside Shell, the bare
			// terminal opens the section, the rest stays alphabetical, and the
			// theme builder closes it — it is a tool, not a case to read through.
			storySort: {
				order: ["Shell", ["Default", "*", "Theme builder"], "Markup"],
			},
		},
		docs: {
			// the code as written in the file, not the JSX rebuilt from args
			source: { type: "code" },
			// the stories bound themselves on the window height: on a docs
			// page, that height has to be handed to them
			story: { inline: false, height: "420px" },
		},
	},
}

export default preview
