import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../../Shell"
import { baseCommands } from "../../../commands/base"
import { test } from "../../../commands/test"
import { flowerTheme, lavenderTheme } from "../../../theme"
import type { ShellThemeInput } from "../../../theme"
import { boxed } from "../../decorators"
import { prose } from "../../i18n"
import { source } from "../../source"
import en from "./Themes.en.md?raw"
import fr from "./Themes.fr.md?raw"
import themesCode from "./Themes.source.md?raw"

/**
 * Written from scratch: only the colors and the prompt. What a theme does
 * not say keeps the value of `defaultTheme` — the font and the box it is
 * served in, here.
 */
const neon: ShellThemeInput = {
	colors: {
		background: "#0B0F1A",
		textColor: "#C8F7FF",
		importantColor: "#FF2E88",
		cmdColor: "#3BF0FF",
		restrictedColor: "#FFD166",
		infoColor: "#A78BFA",
		appColor: "#3BF0FF",
		invisible: "#0B0F1A",
	},
	prompt: "λ",
}

const meta: Meta<typeof Shell> = {
	title: "Shell/Themes",
	component: Shell,
	decorators: [boxed],
	parameters: prose({ en, fr }),
}

export default meta

export const Themes: StoryObj<typeof Shell> = {
	parameters: source(themesCode),
	args: {
		commands: { ...baseCommands, test },
		themes: { flower: flowerTheme, lavender: lavenderTheme, neon },
		theme: "lavender",
		initialCommands: ["title", "help theme"],
		dict: {
			en: { theme: { neon: "Written from scratch, in the story file" } },
		},
	},
}
