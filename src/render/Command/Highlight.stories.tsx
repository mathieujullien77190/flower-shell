import type { Meta, StoryObj } from "@storybook/react-vite"

import { colors, darkTheme, fonts, lightTheme, setTheme } from "@theme"
import type { ShellColors } from "@theme"
import { highlight } from "./helpers"

/**
 * `highlight` colours text through paired markers. Each theme colour has its
 * own marker; wrapped in brackets it becomes a tag (coloured background,
 * readable text inside). A backslash before a marker prints it as-is. These
 * stories render the function on its own, outside the shell.
 */

const noop = (name: string, args: string[]) =>
	// eslint-disable-next-line no-console
	console.log("marker click:", name, args)

/** a terminal-like frame, on the colours of a given theme */
const Screen = ({
	palette = colors(),
	children,
}: {
	palette?: ShellColors
	children: React.ReactNode
}) => (
	<div
		style={{
			background: palette.background,
			color: palette.textColor,
			fontFamily: fonts().shell,
			padding: 24,
			borderRadius: 6,
			whiteSpace: "pre-wrap",
			lineHeight: 2.1,
		}}
	>
		{children}
	</div>
)

/** one row: what you write on the left, what it renders on the right */
const Row = ({
	source,
	nodes,
}: {
	source: string
	nodes: React.ReactNode
}) => (
	<div
		style={{
			display: "grid",
			gridTemplateColumns: "minmax(240px, 1fr) 1fr",
			gap: 24,
			alignItems: "baseline",
		}}
	>
		<code style={{ opacity: 0.55 }}>{source}</code>
		<div>{nodes}</div>
	</div>
)

const meta: Meta = {
	title: "Render/Highlight",
}

export default meta

type Story = StoryObj

const MARKERS = [
	"§ important §",
	"+ info +",
	"` command `",
	"! restricted !",
	"$ brand $",
	"_ invisible (select me) _",
]

const TAGS = ["[§ important §]", "[+ info +]", "[` cmd `]", "[! restricted !]", "[$ brand $]"]

/** each marker, its source on the left and its coloured render on the right */
export const Markers: Story = {
	render: () => {
		setTheme(darkTheme)
		return (
			<Screen>
				{MARKERS.map(s => (
					<Row key={s} source={s} nodes={highlight(s, noop)} />
				))}
			</Screen>
		)
	},
}

/** the same colours, as tags: `[+…+]` gives a solid background */
export const Tags: Story = {
	render: () => {
		setTheme(darkTheme)
		return (
			<Screen>
				{TAGS.map(s => (
					<Row key={s} source={s} nodes={highlight(s, noop)} />
				))}
				<Row
					source="Mixed: +text+ and a [$ tag $] within the sentence"
					nodes={highlight("Mixed: +text+ and a [$ tag $] within the sentence", noop)}
				/>
			</Screen>
		)
	},
}

/**
 * Escaping: `\+` prints the marker instead of colouring, and a lone backslash
 * (a Windows path) stays as-is.
 */
export const Escaped: Story = {
	render: () => {
		setTheme(darkTheme)
		const lines = [
			"Coloured: +this+ — escaped: \\+this\\+",
			"Raw markers: \\§ \\+ \\` \\! \\$",
			"Path C:\\folder\\file stays as-is",
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

/**
 * The two themes side by side. Each render is computed after setting its
 * theme, so the colours are frozen per panel (the theme lives at module
 * level).
 */
export const Themes: Story = {
	render: () => {
		const samples = [...MARKERS.slice(0, 6), ...TAGS]

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
