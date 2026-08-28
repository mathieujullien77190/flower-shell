import { BaseCommand, Command } from "../../types"

export type CommandProps = {
	command: Command
	baseCommand: BaseCommand
	animation: boolean
	canRendered: boolean
	onRendered?: () => void
	onAnimate?: () => void
	onClickCommand?: (name: string, args: string[]) => void
}
