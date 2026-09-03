import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../../Shell"
import { ShellProvider, useShell } from "../../../state/registry"
import { baseCommands } from "../../../commands/base"
import { flowerTheme } from "../../../theme"
import { dictEn } from "../../../i18n/en"
import { dictFr } from "../../../i18n/fr"
import { fresh } from "../../decorators"
import { prose } from "../../i18n"
import { source } from "../../source"
import en from "./Instances.en.md?raw"
import fr from "./Instances.fr.md?raw"
import severalTerminalsCode from "./SeveralTerminals.source.md?raw"

/**
 * One toolbar for both terminals: the id says which one a line goes to, and
 * it is read when the button is clicked, not when this renders.
 */
const Toolbar = () => {
	const shell = useShell()

	return (
		<div style={{ display: "flex", gap: 8, paddingBottom: 12 }}>
			<button onClick={() => shell.run("left", "hello")}>hello, left</button>
			<button onClick={() => shell.run("right", "flowers")}>
				flowers, right
			</button>
			<button onClick={() => shell.runRestricted("left", "title")}>
				title, left
			</button>
		</div>
	)
}

const Box = ({ children }: { children: React.ReactNode }) => (
	<div style={{ minHeight: 0 }}>{children}</div>
)

const meta: Meta<typeof Shell> = {
	title: "Shell/Several terminals",
	component: Shell,
	decorators: [fresh],
	parameters: prose({ en, fr }),
}

export default meta

export const SeveralTerminals: StoryObj<typeof Shell> = {
	name: "Several terminals",
	parameters: source(severalTerminalsCode),
	render: () => (
		<ShellProvider>
			<div
				style={{
					display: "grid",
					gridTemplateRows: "auto 1fr",
					height: "100vh",
					boxSizing: "border-box",
					padding: 24,
					font: "14px/1.6 system-ui, sans-serif",
				}}
			>
				<Toolbar />

				<div
					style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
				>
					<Box>
						<Shell
							id="left"
							commands={baseCommands}
							themes={{ flower: flowerTheme }}
							dict={{ en: dictEn, fr: dictFr }}
							lang="en"
							initialCommands={["welcome"]}
						/>
					</Box>

					<Box>
						<Shell
							id="right"
							commands={baseCommands}
							themes={{ flower: flowerTheme }}
							dict={{ en: dictEn, fr: dictFr }}
							lang="fr"
							initialCommands={["welcome"]}
						/>
					</Box>
				</div>
			</div>
		</ShellProvider>
	),
}
