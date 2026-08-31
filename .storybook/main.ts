import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

import type { StorybookConfig } from "@storybook/react-vite"

/** the configuration folder, in slashes — see `manager-preset.ts` */
const here = dirname(fileURLToPath(import.meta.url)).replace(/\\/g, "/")

/** the terminal runs on its own: the stories live next to the code */
const config: StorybookConfig = {
	stories: ["../src/**/*.stories.@(ts|tsx)"],
	// the Docs panel, and with it the Source block: each story shows the
	// code that produces what is displayed
	addons: [
		"@storybook/addon-docs",
		// it declares `manager.ts`, which Storybook does not find on its own here
		`${here}/manager-preset.ts`,
	],
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
