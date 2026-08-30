import { colors, fonts } from "../../theme"
import type { ShellColors } from "../../theme"

/**
 * `highlight` colors text through paired markers. Each theme color has its
 * own marker; wrapped in brackets it becomes a tag (colored background,
 * readable text inside). A backslash before a marker prints it as-is. These
 * stories render the function on its own, outside the shell.
 */

/** the click handler the marker `#…~ cmd#` calls: logged, not played */
export const noop = (name: string, args: string[]) =>
	// eslint-disable-next-line no-console
	console.log("marker click:", name, args)

/** a terminal-like frame, on the colors of a given theme */
export const Screen = ({
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
export const Row = ({
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

/** one marker per theme color, inline */
export const MARKERS = [
	"§important§",
	"+info+",
	"`command`",
	"!restricted!",
	"$brand$",
	"_invisible (select me)_",
]

/** the same colors in brackets: a solid background instead of a text color */
export const TAGS = [
	"[§important§]",
	"[+info+]",
	"[`cmd`]",
	"[!restricted!]",
	"[$brand$]",
]
