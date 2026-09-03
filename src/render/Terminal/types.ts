import { RefObject } from "react"

import { Command } from "@types"

export type TerminalProps = {
	/** the box that scrolls: the shell scrolls it down as the output grows */
	boxRef: RefObject<HTMLDivElement | null>
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
