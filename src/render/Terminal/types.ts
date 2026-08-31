import { Command } from "@types"

export type TerminalProps = {
	commands: Command[]
	currentCommand: Command | null
	options: { lang: string; animation: boolean; keyboardOnFocus: boolean }
	onSendCommand: (commandPattern: string) => void
	onAnimateCommand: () => void
	onSendRestrictedCommand: (commandPattern: string) => void
	onSendPreviousCommand: () => void
	onSendNextCommand: () => void
	onRendered: (id: string) => void
}
