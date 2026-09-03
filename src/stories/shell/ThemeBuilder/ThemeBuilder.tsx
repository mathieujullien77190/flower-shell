import { useState } from "react"

import { Shell } from "../../../Shell"
import { baseCommands } from "../../../commands/base"
import { test } from "../../../commands/test"
import { themes } from "../../../theme"
import { useLocale, type Labels } from "../../i18n"
import type { ShellColors, ShellTheme } from "../../../theme"

/**
 * The preview: a real shell, wearing the draft. It opens on `test`, which
 * prints every color of the theme — the palette being edited, rendered by
 * the code that will render it for real.
 *
 * It remounts on every touch of a picker, through the `key` its parent
 * gives it. A remounted shell is a new shell — the store comes with the
 * instance — so it starts on an empty screen and plays `initialCommands`
 * again, which is what makes the preview follow.
 *
 * Animation off, and only here: replaying `test` letter by letter at every
 * keystroke would show the palette a second after the color changed.
 *
 * And the keyboard focus let go, which matters more than it sounds: the
 * shell takes it back on every mouse release anywhere on the page, so that
 * a visitor can type without aiming. Here the page is not the shell — it is
 * a form around it, and a picker or a select would be closed the instant it
 * was opened. A click on the preview still hands it the keyboard: that one
 * is asked for, and it is how one types in it.
 */
const Preview = ({ draft }: { draft: ShellTheme }) => (
	<Shell
		commands={{ ...baseCommands, test }}
		theme="draft"
		// the draft is the only reachable theme: the preview shows what is
		// being written, not the catalogue of the package
		themes={{ draft }}
		initialCommands={["test"]}
		animation={false}
		keyboardOnFocus={false}
	/>
)

/** what a picker edits: the label people read, the key the theme uses */
const SHELL_FIELDS: { key: keyof ShellColors; label: string }[] = [
	{ key: "background", label: "background" },
	{ key: "textColor", label: "text" },
	{ key: "importantColor", label: "important" },
	{ key: "cmdColor", label: "command" },
	{ key: "restrictedColor", label: "restricted" },
	{ key: "infoColor", label: "info" },
	{ key: "appColor", label: "brand" },
	{ key: "scrollbarThumb", label: "scrollbar thumb" },
	{ key: "scrollbarTrack", label: "scrollbar track" },
]

/**
 * A color input only accepts `#rrggbb`. Two of the shipped themes name a
 * CSS color instead — `lightGray`, `gray` — so the picker needs a hex to
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

/**
 * The theme, written the way it would be pasted at home: in `themes`, under
 * a name, and `theme` to start on it. The name is what the visitor will type
 * behind `theme`, and what the dictionary key `theme.<name>` describes.
 */
const asCode = (draft: ShellTheme) =>
	[
		"const mine = {",
		"  colors: {",
		...SHELL_FIELDS.map(
			field => `    ${field.key}: "${draft.colors[field.key]}",`
		),
		"    // the background again: text laid on it shows only when selected",
		`    invisible: "${draft.colors.background}",`,
		"  },",
		`  prompt: "${draft.prompt}",`,
		"}",
		"",
		"<Shell",
		"  commands={baseCommands}",
		"  themes={{ mine }}",
		'  theme="mine"',
		"/>",
	].join("\n")

/**
 * The name the draft takes as soon as it is touched: it no longer comes out
 * of the catalogue, and leaving it shown under the name of a theme of the
 * package would make the picker say something false.
 */
const CUSTOM = "custom"

/**
 * The titles of the panel, in the language of the page. The pickers keep
 * the names of the colors they edit — they are the keys of the theme, read
 * again in the code block below.
 */
const LABELS: Labels<{
	base: string
	prompt: string
	shell: string
	preview: string
	code: string
}> = {
	en: {
		base: "start from",
		prompt: "prompt",
		shell: "shell",
		preview: "preview",
		code: "your theme",
	},
	fr: {
		base: "partir de",
		prompt: "invite",
		shell: "shell",
		preview: "aperçu",
		code: "votre thème",
	},
}

export const ThemeBuilder = () => {
	const label = LABELS[useLocale()]

	const [base, setBase] = useState("flower")
	const [draft, setDraft] = useState<ShellTheme>(themes.flower)

	const pickBase = (name: string) => {
		// `custom` is already the draft under way: there is nothing to load
		if (name === CUSTOM) return

		setBase(name)
		setDraft(themes[name])
	}

	/** any edit detaches the draft from the theme it started from */
	const edit = (change: (current: ShellTheme) => ShellTheme) => {
		setBase(CUSTOM)
		setDraft(change)
	}

	const setColor = (key: keyof ShellColors, value: string) =>
		edit(current => ({
			...current,
			// the background and the invisible are one: one follows the other
			colors: {
				...current.colors,
				[key]: value,
				...(key === "background" ? { invisible: value } : {}),
			},
		}))

	/**
	 * The signature of the draft, handed as `key` to the preview: it changes
	 * as soon as a color moves, and React then mounts the shell again. A
	 * shell already mounted would not play its opening over, and the theme
	 * lives at module level — remounting is what makes the preview follow.
	 */
	const signature = JSON.stringify(draft)

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
				<Group title={label.base}>
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
						{/* it only shows up once the draft has been edited: before
						    that, there is nothing for it to point at */}
						{base === CUSTOM && <option value={CUSTOM}>{CUSTOM}</option>}
					</select>
				</Group>

				<Group title={label.prompt}>
					<input
						value={draft.prompt}
						onChange={event =>
							edit(current => ({ ...current, prompt: event.target.value }))
						}
						style={{
							font: "14px/1.5 ui-monospace, monospace",
							padding: "6px 8px",
							border: "1px solid #000000",
							borderRadius: 4,
							width: 80,
						}}
					/>
				</Group>

				<Group title={label.shell}>
					{SHELL_FIELDS.map(({ key, label }) => (
						<Picker
							key={key}
							label={label}
							value={draft.colors[key]}
							onChange={value => setColor(key, value)}
						/>
					))}
				</Group>
			</div>

			<div style={{ display: "grid", gap: 20 }}>
				<Group title={label.preview}>
					{/* The shell takes this whole box: it needs a height, and the
					    package imposes none. It scrolls inside it on its own — the
					    scrollbar being edited two pickers above is the one showing
					    here, as soon as `test` runs past 700px. */}
					<div style={{ height: 700, boxSizing: "border-box" }}>
						<Preview key={signature} draft={draft} />
					</div>
				</Group>

				<Group title={label.code}>
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
