import type { Meta, StoryObj } from "@storybook/react-vite"

import { highlight } from "../../render/Command/helpers"
import { darkTheme, lightTheme, setTheme } from "../../theme"
import { renderOnly } from "../source"
import { MARKERS, Row, Screen, TAGS, noop } from "./screen"

/**
 * The two themes side by side. Each render is computed after setting its
 * theme, so the colours are frozen per panel (the theme lives at module
 * level).
 */
const meta: Meta = {
	title: "Markup/Themes",
}

export default meta

export const Themes: StoryObj = {
	parameters: renderOnly,
	render: () => {
		const samples = [...MARKERS, ...TAGS]

		setTheme(darkTheme)
		const dark = samples.map(s => ({ s, n: highlight(s, noop) }))
		setTheme(lightTheme)
		const light = samples.map(s => ({ s, n: highlight(s, noop) }))

		return (
			<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
				<Screen palette={darkTheme.colors}>
					{dark.map(({ s, n }) => (
						<Row key={s} source={s} nodes={n} />
					))}
				</Screen>
				<Screen palette={lightTheme.colors}>
					{light.map(({ s, n }) => (
						<Row key={s} source={s} nodes={n} />
					))}
				</Screen>
			</div>
		)
	},
}
