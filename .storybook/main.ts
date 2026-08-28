import type { StorybookConfig } from "@storybook/react-vite"

/** le terminal se lance seul : les stories vivent a cote du code */
const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(ts|tsx)"],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
}

export default config
