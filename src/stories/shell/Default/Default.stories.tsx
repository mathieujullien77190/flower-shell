import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../../Shell"
import { boxed } from "../../decorators"
import { prose } from "../../i18n"
import { source } from "../../source"
import en from "./Default.en.md?raw"
import fr from "./Default.fr.md?raw"
import defaultCode from "./Default.source.md?raw"

const meta: Meta<typeof Shell> = {
	title: "Shell/Default",
	component: Shell,
	decorators: [boxed],
	// the only page carrying the table of the props: it is the same
	// everywhere, and this is where one comes in
	parameters: prose({ en, fr }, { controls: true }),
}

export default meta

export const Default: StoryObj<typeof Shell> = {
	parameters: source(defaultCode),
}
