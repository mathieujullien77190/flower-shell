import { BaseCommands } from "@types"
import type { ShellInstance } from "@state/instance"

export type InputProps = {
	/** the shell it types into: its dictionaries answer the two texts below */
	instance: ShellInstance
	/** the commands of this shell, for the autocompletion alone */
	known: BaseCommands
	value?: string
	forceFocus?: number
	options: { lang: string; animation: boolean; keyboardOnFocus: boolean }
	onValidate?: (commandPattern: string) => void
	onCallPrevious?: () => void
	onCallNext?: () => void
}
