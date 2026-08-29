import { useMemo, useState } from "react"

import { highlight } from "../../render/Command/helpers"
import { setTheme, themes } from "../../theme"
import type { ShellColors, ShellTheme, WindowColors } from "../../theme"

const noop = () => {}

/** the sample the preview renders, one line per colour of the palette */
const SAMPLE = [
	"§important§",
	"+info+",
	"`command`",
	"!restricted!",
	"$brand$",
	"_invisible (select me)_",
	"[§important§] [+info+] [`cmd`] [!restricted!] [$brand$]",
]

/** what a picker edits: the label people read, the key the theme uses */
const SHELL_FIELDS: { key: keyof ShellColors; label: string }[] = [
	{ key: "background", label: "background" },
	{ key: "textColor", label: "text" },
	{ key: "importantColor", label: "important" },
	{ key: "cmdColor", label: "command" },
	{ key: "restrictedColor", label: "restricted" },
	{ key: "infoColor", label: "info" },
	{ key: "appColor", label: "brand" },
]

const WINDOW_FIELDS: { key: keyof WindowColors; label: string }[] = [
	{ key: "titleBar", label: "title bar" },
	{ key: "border", label: "border" },
	{ key: "content", label: "content" },
	{ key: "text", label: "title text" },
	{ key: "button", label: "button" },
	{ key: "buttonHover", label: "button hover" },
]

/**
 * A colour input only accepts `#rrggbb`. Two of the shipped themes name a
 * CSS colour instead — `lightGray`, `gray` — so the picker needs a hex to
 * open on. The browser measures it for us.
 */
const toHex = (value: string) => {
	if (/^#[0-9a-f]{6}$/i.test(value)) return value

	const probe = document.createElement("div")
	probe.style.color = value
	document.body.appendChild(probe)
	const measured = getComputedStyle(probe).color
	probe.remove()

	const channels = measured.match(/\d+/g)
	if (!channels) return "#000000"

	return `#${channels
		.slice(0, 3)
		.map(channel => Number(channel).toString(16).padStart(2, "0"))
		.join("")}`
}

const Picker = ({
	label,
	value,
	onChange,
}: {
	label: string
	value: string
	onChange: (next: string) => void
}) => (
	<label
		style={{
			display: "grid",
			gridTemplateColumns: "auto 1fr auto",
			alignItems: "center",
			gap: 10,
			font: "13px/1.5 ui-monospace, monospace",
		}}
	>
		<input
			type="color"
			value={toHex(value)}
			onChange={event => onChange(event.target.value)}
			style={{
				width: 34,
				height: 26,
				padding: 0,
				border: "1px solid rgba(128,128,128,0.4)",
				borderRadius: 4,
				background: "none",
				cursor: "pointer",
			}}
		/>
		<span>{label}</span>
		<code style={{ opacity: 0.6 }}>{value}</code>
	</label>
)

const Group = ({
	title,
	children,
}: {
	title: string
	children: React.ReactNode
}) => (
	<section style={{ display: "grid", gap: 8 }}>
		<h3
			style={{
				margin: 0,
				font: "600 11px/1.4 ui-monospace, monospace",
				letterSpacing: "0.1em",
				textTransform: "uppercase",
				opacity: 0.6,
			}}
		>
			{title}
		</h3>
		{children}
	</section>
)

/** the theme, written as you would paste it into the `theme` prop */
const asCode = (draft: ShellTheme) =>
	[
		"<Shell",
		"  commands={baseCommands}",
		"  theme={{",
		"    colors: {",
		...SHELL_FIELDS.map(
			field => `      ${field.key}: "${draft.colors[field.key]}",`
		),
		"      // the background again: text laid on it shows only when selected",
		`      invisible: "${draft.colors.background}",`,
		"    },",
		`    prompt: "${draft.prompt}",`,
		"    window: {",
		...WINDOW_FIELDS.map(
			field => `      ${field.key}: "${draft.window[field.key]}",`
		),
		"    },",
		"  }}",
		"/>",
	].join("\n")

export const ThemeBuilder = () => {
	const [base, setBase] = useState("flower")
	const [draft, setDraft] = useState<ShellTheme>(themes.flower)

	const pickBase = (name: string) => {
		setBase(name)
		setDraft(themes[name])
	}

	const setColor = (key: keyof ShellColors, value: string) =>
		setDraft(current => ({
			...current,
			// le fond et l'invisible ne font qu'un : l'un suit l'autre
			colors: {
				...current.colors,
				[key]: value,
				...(key === "background" ? { invisible: value } : {}),
			},
		}))

	const setWindowColor = (key: keyof WindowColors, value: string) =>
		setDraft(current => ({
			...current,
			window: { ...current.window, [key]: value },
		}))

	/**
	 * `highlight` lit les couleurs du module a l'appel, pas des props : on
	 * pose donc le brouillon juste avant de calculer le rendu. C'est ce qui
	 * fait suivre l'apercu a la moindre touche du picker.
	 */
	const preview = useMemo(() => {
		setTheme(draft)
		return SAMPLE.map(line => ({ line, nodes: highlight(line, noop) }))
	}, [draft])

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "minmax(260px, 320px) 1fr",
				gap: 24,
				alignItems: "start",
				font: "14px/1.6 system-ui, sans-serif",
			}}
		>
			<div style={{ display: "grid", gap: 20 }}>
				<Group title="start from">
					<select
						value={base}
						onChange={event => pickBase(event.target.value)}
						style={{
							font: "13px/1.5 ui-monospace, monospace",
							padding: "6px 8px",
							borderRadius: 4,
						}}
					>
						{Object.keys(themes).map(name => (
							<option key={name} value={name}>
								{name}
							</option>
						))}
					</select>
				</Group>

				<Group title="prompt">
					<input
						value={draft.prompt}
						onChange={event =>
							setDraft(current => ({ ...current, prompt: event.target.value }))
						}
						style={{
							font: "14px/1.5 ui-monospace, monospace",
							padding: "6px 8px",
							borderRadius: 4,
							width: 80,
						}}
					/>
				</Group>

				<Group title="shell">
					{SHELL_FIELDS.map(({ key, label }) => (
						<Picker
							key={key}
							label={label}
							value={draft.colors[key]}
							onChange={value => setColor(key, value)}
						/>
					))}
				</Group>

				<Group title="window frame">
					{WINDOW_FIELDS.map(({ key, label }) => (
						<Picker
							key={key}
							label={label}
							value={draft.window[key]}
							onChange={value => setWindowColor(key, value)}
						/>
					))}
				</Group>
			</div>

			<div style={{ display: "grid", gap: 20 }}>
				<Group title="preview">
					<div
						style={{
							border: `2px solid ${draft.window.border}`,
							borderRadius: 6,
							overflow: "hidden",
						}}
					>
						<div
							style={{
								background: draft.window.titleBar,
								color: draft.window.text,
								font: "bold 13px/1 ui-monospace, monospace",
								padding: "8px 10px",
								display: "flex",
								justifyContent: "space-between",
							}}
						>
							<span>flower-shell</span>
							<span style={{ color: draft.window.button }}>+ x</span>
						</div>

						<div style={{ background: draft.window.content, padding: 12 }}>
							<div
								style={{
									background: draft.colors.background,
									color: draft.colors.textColor,
									font: "14px/2 ui-monospace, monospace",
									padding: 16,
									whiteSpace: "pre-wrap",
								}}
							>
								{preview.map(({ line, nodes }) => (
									<div key={line}>{nodes}</div>
								))}
								<div>
									<strong>{draft.prompt}</strong>{" "}
									<span style={{ color: draft.colors.cmdColor }}>help</span>
								</div>
							</div>
						</div>
					</div>
				</Group>

				<Group title="your theme">
					<pre
						style={{
							margin: 0,
							padding: 16,
							borderRadius: 6,
							overflowX: "auto",
							background: "rgba(128,128,128,0.12)",
							font: "12px/1.6 ui-monospace, monospace",
						}}
					>
						{asCode(draft)}
					</pre>
				</Group>
			</div>
		</div>
	)
}
