import type { Meta, StoryObj } from "@storybook/react-vite"

import { highlight } from "../../render/Command/helpers"
import { twilightTheme, setTheme } from "../../theme"
import { prose } from "../i18n"
import { renderOnly } from "../source"
import { Row, Screen, noop } from "./screen"

const meta: Meta = {
	title: "Markup/Escaping",
	parameters: prose({
		en: "Escaping: `\\+` prints the marker instead of coloring, and a lone backslash stays as-is.",
		fr: "Échappement : `\\+` affiche le marqueur au lieu de colorer, et un antislash seul reste tel quel.",
	}),
}

export default meta

export const Escaping: StoryObj = {
	parameters: renderOnly,
	render: () => {
		setTheme(twilightTheme)
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
