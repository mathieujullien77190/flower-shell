import type { Meta, StoryObj } from "@storybook/react-vite"

import { highlight } from "../../../render/Command/helpers"
import { flowerTheme, setTheme } from "../../../theme"
import { prose } from "../../i18n"
import { renderOnly } from "../../source"
import { Row, Screen, TAGS, noop } from "../screen"
import en from "./Tags.en.md?raw"
import fr from "./Tags.fr.md?raw"

const meta: Meta = {
	title: "Markup/Tags",
	parameters: prose({ en, fr }),
}

export default meta

export const Tags: StoryObj = {
	parameters: renderOnly,
	render: () => {
		setTheme(flowerTheme)
		return (
			<Screen>
				{TAGS.map(s => (
					<Row key={s} source={s} nodes={highlight(s, noop)} />
				))}
				<Row
					source="Mixed: +text+ and a [$tag$] within the sentence"
					nodes={highlight(
						"Mixed: +text+ and a [$tag$] within the sentence",
						noop
					)}
				/>
			</Screen>
		)
	},
}
