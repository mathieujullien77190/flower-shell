import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../../Shell"
import { ShellProvider, useShell } from "../../../state/registry"
import { baseCommands } from "../../../commands/base"
import { testCommand as test } from "../../../commands/common/test"
import { themes } from "../../../theme"
import { dictEn } from "../../../i18n/en"
import { dictFr } from "../../../i18n/fr"
import { prose, useLocale, type Labels } from "../../i18n"
import { source } from "../../source"
import en from "./RemoteControl.en.md?raw"
import fr from "./RemoteControl.fr.md?raw"
import remoteControlCode from "./RemoteControl.source.md?raw"

const TERMINAL = "terminal"

/** what a read of `actions(id)` gives back, frozen at the moment it was asked */
type Snapshot = { lang: string; animation: boolean; played: number }

/**
 * What the panel says, in the language of the page. The buttons are not in
 * there: `run`, `clear`, `lang fr`, `title` name the API and the commands,
 * and they are typed the same in either language.
 */
const LABELS: Labels<{
	play: string
	restricted: string
	state: string
	read: string
	nothing: string
	played: string
}> = {
	en: {
		play: "play a line",
		restricted: "restricted",
		state: "its state",
		read: "read it back",
		nothing: "nothing read yet",
		played: "played",
	},
	fr: {
		play: "jouer une ligne",
		restricted: "restreintes",
		state: "son état",
		read: "le relire",
		nothing: "rien de lu pour l'instant",
		played: "jouées",
	},
}

const Remote = () => {
	const label = LABELS[useLocale()]

	const shell = useShell()
	const [line, setLine] = useState("help")
	const [seen, setSeen] = useState<Snapshot | null>(null)

	const read = () => {
		const state = shell.actions(TERMINAL)

		setSeen({
			lang: state.lang,
			animation: state.animation,
			played: state.commands.length,
		})
	}

	return (
		<div style={{ display: "grid", gap: 20, alignContent: "start" }}>
			<Group title={label.play}>
				<form
					style={{ display: "flex", gap: 8 }}
					onSubmit={event => {
						event.preventDefault()
						shell.run(TERMINAL, line)
					}}
				>
					<input
						value={line}
						onChange={event => setLine(event.target.value)}
						style={{
							flex: 1,
							font: "13px/1.5 ui-monospace, monospace",
							padding: "6px 8px",
							border: "1px solid #000000",
							borderRadius: 4,
						}}
					/>
					<button type="submit">run</button>
				</form>

				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<button onClick={() => shell.run(TERMINAL, "flowers")}>
						flowers
					</button>
					<button onClick={() => shell.run(TERMINAL, "test")}>test</button>
					<button onClick={() => shell.run(TERMINAL, "nope")}>nope</button>
				</div>
			</Group>

			<Group title={label.restricted}>
				{/* the visitor cannot type these: they only come from here */}
				<div style={{ display: "flex", gap: 8 }}>
					<button onClick={() => shell.runRestricted(TERMINAL, "title")}>
						title
					</button>
					<button onClick={() => shell.runRestricted(TERMINAL, "welcome")}>
						welcome
					</button>
				</div>
			</Group>

			<Group title={label.state}>
				<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
					<button onClick={() => shell.actions(TERMINAL).clear()}>clear</button>
					<button onClick={() => shell.actions(TERMINAL).reset()}>reset</button>
					<button onClick={() => shell.actions(TERMINAL).setLang("fr")}>
						lang fr
					</button>
					<button onClick={() => shell.actions(TERMINAL).setLang("en")}>
						lang en
					</button>
					<button onClick={() => shell.actions(TERMINAL).setAnimation(false)}>
						animation off
					</button>
				</div>
			</Group>

			<Group title={label.read}>
				<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
					<button onClick={read}>read</button>
					<code style={{ opacity: 0.7, font: "12px ui-monospace, monospace" }}>
						{seen
							? `lang ${seen.lang} · animation ${seen.animation ? "on" : "off"} · ${seen.played} ${label.played}`
							: label.nothing}
					</code>
				</div>
			</Group>
		</div>
	)
}

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

const meta: Meta<typeof Shell> = {
	title: "Shell/Remote control",
	component: Shell,
	parameters: prose({ en, fr }),
}

export default meta

export const RemoteControl: StoryObj<typeof Shell> = {
	name: "Remote control",
	parameters: source(remoteControlCode),
	render: () => (
		<ShellProvider>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "minmax(260px, 320px) 1fr",
					gap: 24,
					height: "100vh",
					boxSizing: "border-box",
					padding: 24,
					font: "14px/1.6 system-ui, sans-serif",
				}}
			>
				<Remote />

				<div style={{ minHeight: 0 }}>
					<Shell
						id={TERMINAL}
						commands={{ ...baseCommands, test }}
						themes={themes}
						dict={{ en: dictEn, fr: dictFr }}
						initialCommands={["title", "welcome"]}
					/>
				</div>
			</div>
		</ShellProvider>
	),
}
