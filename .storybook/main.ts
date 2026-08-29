import type { StorybookConfig } from "@storybook/react-vite"

/** the terminal runs on its own: the stories live next to the code */
const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(ts|tsx)"],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	// no onboarding checklist: neither in the sidebar nor in the menu
	features: {
		sidebarOnboardingChecklist: false,
		menuOnboardingChecklist: false,
	},
}

export default config
