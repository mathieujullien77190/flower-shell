import type { Meta, StoryObj } from "@storybook/react-vite"

import { highlight } from "../../render/Command/helpers"
import { flowerTheme, setTheme } from "../../theme"
import { prose } from "../i18n"
import { renderOnly } from "../source"
import { MARKERS, Row, Screen, noop } from "./screen"

const meta: Meta = {
	title: "Markup/Markers",
	parameters: prose({
		en: "Each marker, its source on the left and its colored render on the right.",
		fr: "Chaque marqueur, sa source à gauche et son rendu coloré à droite.",
	}),
}

export default meta

export const Markers: StoryObj = {
	parameters: renderOnly,
	render: () => {
		setTheme(flowerTheme)
		return (
			<Screen>
				{MARKERS.map(s => (
					<Row key={s} source={s} nodes={highlight(s, noop)} />
				))}
			</Screen>
		)
	},
}
