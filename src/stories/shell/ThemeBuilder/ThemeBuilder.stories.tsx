import type { Meta, StoryObj } from "@storybook/react-vite"

import { prose } from "../../i18n"
import { renderOnly } from "../../source"
import { ThemeBuilder } from "./ThemeBuilder"
import en from "./ThemeBuilder.en.md?raw"
import fr from "./ThemeBuilder.fr.md?raw"

const meta: Meta<typeof ThemeBuilder> = {
	title: "Shell/Theme builder",
	component: ThemeBuilder,
	parameters: prose({ en, fr }),
}

export default meta

export const ThemeBuilderStory: StoryObj<typeof ThemeBuilder> = {
	name: "Theme builder",
	parameters: renderOnly,
	render: () => <ThemeBuilder />,
}
