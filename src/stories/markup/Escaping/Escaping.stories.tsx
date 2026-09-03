import type { Meta, StoryObj } from "@storybook/react-vite"

import { highlight } from "../../../render/Command/helpers"
import { flowerTheme, setTheme } from "../../../theme"
import { prose } from "../../i18n"
import { renderOnly } from "../../source"
import { Row, Screen, noop } from "../screen"
import en from "./Escaping.en.md?raw"
import fr from "./Escaping.fr.md?raw"

const meta: Meta = {
	title: "Markup/Escaping",
	parameters: prose({ en, fr }),
}

export default meta

export const Escaping: StoryObj = {
	parameters: renderOnly,
	render: () => {
		setTheme(flowerTheme)
		const lines = [
			"Colored: +this+ — escaped: \\+this\\+",
			"Raw markers: \\§ \\+ \\` \\! \\$",
		]
		return (
			<Screen>
				{lines.map(s => (
					<Row key={s} source={s} nodes={highlight(s, noop)} />
				))}
			</Screen>
		)
	},
}
