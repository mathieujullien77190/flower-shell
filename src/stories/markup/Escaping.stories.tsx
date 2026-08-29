import type { Meta, StoryObj } from "@storybook/react-vite"

import { highlight } from "../../render/Command/helpers"
import { darkTheme, setTheme } from "../../theme"
import { renderOnly } from "../source"
import { Row, Screen, noop } from "./screen"

/**
 * Escaping: `\+` prints the marker instead of colouring, and a lone backslash
 * stays as-is.
 */
const meta: Meta = {
	title: "Markup/Escaping",
}

export default meta

export const Escaping: StoryObj = {
	parameters: renderOnly,
	render: () => {
		setTheme(darkTheme)
		const lines = [
			"Coloured: +this+ — escaped: \+this\+",
			"Raw markers: \§ \+ \` \! \$",
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
