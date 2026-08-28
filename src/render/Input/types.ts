export type InputProps = {
	value?: string
	forceFocus?: number
	options: { lang: string; animation: boolean; keyboardOnFocus: boolean }
	onValidate?: (commandPattern: string) => void
	onCallPrevious?: () => void
	onCallNext?: () => void
}
