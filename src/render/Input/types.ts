import { BaseCommands } from "@types"

export type InputProps = {
	/** the commands of this shell, for the autocompletion alone */
	known: BaseCommands
	value?: string
	forceFocus?: number
	options: { lang: string; animation: boolean; keyboardOnFocus: boolean }
	onValidate?: (commandPattern: string) => void
	onCallPrevious?: () => void
	onCallNext?: () => void
}
