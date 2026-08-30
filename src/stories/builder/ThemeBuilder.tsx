import { useState } from "react"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { shellActions } from "../../state/store"
import { themes } from "../../theme"
import type { ShellColors, ShellTheme, WindowColors } from "../../theme"

/**
 * The preview: a real shell, in a real window, wearing the draft. It opens
 * on `test`, which prints every colour of the theme — the palette being
 * edited, rendered by the code that will render it for real.
 *
 * It remounts on every touch of a picker, through the `key` its parent
 * gives it. The registry and the history live at module level, so the
 * remount has to start from an empty screen: without the reset, the shell
 * would find the previous lines on screen and skip `initialCommands`.
 *
 * Animation off, and only here: replaying `test` letter by letter at every
 * keystroke would show the palette a second after the colour changed.
 *
 * And the keyboard focus let go, which matters more than it sounds: the
 * shell takes it back on every mouse release anywhere on the page, so that
 * a visitor can type without aiming. Here the page is not the shell — it is
 * a form around it, and a picker or a select would be closed the instant it
 * was opened.
 */
const Preview = ({ draft }: { draft: ShellTheme }) => {
	useState(() => {
		shellActions().reset()
		shellActions().setAnimation(false)
		shellActions().setKeyboardOnFocus(false)
		return true
	})

	return (
		<Shell
			commands={{ ...baseCommands, test }}
			theme={draft}
			initialCommands={["test"]}
			// pleine : l'apercu sert a lire une palette, chaque pixel rendu au
			// terminal en est un de moins a faire defiler. La marge tient au
			// cadre autour, pas a la fenetre
			window={{ title: "flower-shell", canClose: false, compact: true }}
		/>
	)
}

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

/**
 * Le nom que prend le brouillon des qu'on y touche : il ne sort plus du
 * catalogue, et le laisser affiche sous le nom d'un theme du paquet
 * ferait dire au selecteur quelque chose de faux.
 */
const CUSTOM = "custom"

export const ThemeBuilder = () => {
	const [base, setBase] = useState("flower")
	const [draft, setDraft] = useState<ShellTheme>(themes.flower)

	const pickBase = (name: string) => {
		// `custom`, c'est deja le brouillon en cours : il n'y a rien a charger
		if (name === CUSTOM) return

		setBase(name)
		setDraft(themes[name])
	}

	/** toute retouche detache le brouillon du theme dont il est parti */
	const edit = (change: (current: ShellTheme) => ShellTheme) => {
		setBase(CUSTOM)
		setDraft(change)
	}

	const setColor = (key: keyof ShellColors, value: string) =>
		edit(current => ({
			...current,
			// le fond et l'invisible ne font qu'un : l'un suit l'autre
			colors: {
				...current.colors,
				[key]: value,
				...(key === "background" ? { invisible: value } : {}),
			},
		}))

	const setWindowColor = (key: keyof WindowColors, value: string) =>
		edit(current => ({
			...current,
			window: { ...current.window, [key]: value },
		}))

	/**
	 * La signature du brouillon, donnee en `key` a l'apercu : elle change des
	 * qu'une couleur bouge, et React remonte alors le shell. Un shell deja
	 * monte ne rejouerait pas son ouverture, et le theme vit au niveau du
	 * module — le remontage est ce qui fait suivre l'apercu.
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
						{/* il n'apparait qu'une fois le brouillon retouche : avant, il
						    n'y a rien qu'il designerait */}
						{base === CUSTOM && <option value={CUSTOM}>{CUSTOM}</option>}
					</select>
				</Group>

				<Group title="prompt">
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
					{/* La fenetre prend tout ce cadre : il lui faut une hauteur, le
					    paquet n'en impose aucune. Assez haute pour que `test` tienne
					    d'un bloc — le shell descend sur sa derniere ligne, et c'est
					    la liste des couleurs qui passerait au-dessus. La marge, elle,
					    se pose ici : quelques pixels pour detacher le cadre. */}
					<div
						style={{
							height: 700,
							padding: 8,
							boxSizing: "border-box",
							background: "#84787A",
							borderRadius: 6,
						}}
					>
						<Preview key={signature} draft={draft} />
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
