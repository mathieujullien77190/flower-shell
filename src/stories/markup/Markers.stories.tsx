import type { Meta, StoryObj } from "@storybook/react-vite"

import { highlight } from "../../render/Command/helpers"
import { twilightTheme, setTheme } from "../../theme"
import { renderOnly } from "../source"
import { MARKERS, Row, Screen, noop } from "./screen"

/** each marker, its source on the left and its coloured render on the right */
const meta: Meta = {
	title: "Markup/Markers",
}

export default meta

export const Markers: StoryObj = {
	parameters: renderOnly,
	render: () => {
		setTheme(twilightTheme)
		return (
			<Screen>
				{MARKERS.map(s => (
					<Row key={s} source={s} nodes={highlight(s, noop)} />
				))}
			</Screen>
		)
	},
}
