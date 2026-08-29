import type { Meta, StoryObj } from "@storybook/react-vite"

import { highlight } from "../../render/Command/helpers"
import { setTheme, themes } from "../../theme"
import { renderOnly } from "../source"
import { MARKERS, Row, Screen, TAGS, noop } from "./screen"

/**
 * The whole catalogue, one panel per theme. Each render is computed right
 * after its theme is set, so the colours are frozen per panel — the theme
 * lives at module level, and the last one set would otherwise win for all
 * of them.
 *
 * This is what a palette is judged on: the same six markers and five tags
 * have to stay legible, and stay distinct from one another, on every ground.
 */
const meta: Meta = {
	title: "Markup/Themes",
}

export default meta

const caption: React.CSSProperties = {
	margin: "0 0 8px",
	font: "600 12px/1.4 ui-monospace, monospace",
	letterSpacing: "0.08em",
	textTransform: "uppercase",
	opacity: 0.7,
}

export const Themes: StoryObj = {
	parameters: renderOnly,
	render: () => {
		const samples = [...MARKERS, ...TAGS]

		// le rendu est fige theme par theme, avant de passer au suivant
		const panels = Object.entries(themes).map(([name, shellTheme]) => {
			setTheme(shellTheme)
			return {
				name,
				palette: shellTheme.colors,
				rows: samples.map(s => ({ s, nodes: highlight(s, noop) })),
			}
		})

		return (
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
					gap: 20,
				}}
			>
				{panels.map(({ name, palette, rows }) => (
					<section key={name}>
						<h3 style={caption}>{name}</h3>
						<Screen palette={palette}>
							{rows.map(({ s, nodes }) => (
								<Row key={s} source={s} nodes={nodes} />
							))}
						</Screen>
					</section>
				))}
			</div>
		)
	},
}
