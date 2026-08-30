import type { Meta, StoryObj } from "@storybook/react-vite"

import { highlight } from "../../render/Command/helpers"
import { twilightTheme, setTheme } from "../../theme"
import { prose } from "../i18n"
import { renderOnly } from "../source"
import { Row, Screen, TAGS, noop } from "./screen"

const meta: Meta = {
	title: "Markup/Tags",
	parameters: prose({
		en: "The same colors, as tags: `[+…+]` gives a solid background.",
		fr: "Les mêmes couleurs, en tags : `[+…+]` donne un fond plein.",
	}),
}

export default meta

export const Tags: StoryObj = {
	parameters: renderOnly,
	render: () => {
		setTheme(twilightTheme)
		return (
			<Screen>
				{TAGS.map(s => (
					<Row key={s} source={s} nodes={highlight(s, noop)} />
				))}
				<Row
					source="Mixed: +text+ and a [$tag$] within the sentence"
					nodes={highlight("Mixed: +text+ and a [$tag$] within the sentence", noop)}
				/>
			</Screen>
		)
	},
}
