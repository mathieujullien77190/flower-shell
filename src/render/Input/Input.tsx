import React, {
	useCallback,
	useId,
	useState,
	KeyboardEvent,
	useRef,
	useEffect,
} from "react"
import { InputProps } from "./types"
import { isMobile } from "react-device-detect"

import { useTheme } from "styled-components"
import { t } from "@i18n/lang"
import { withInstance } from "@state/instance"

import { autocompleteCommand } from "@engine/terminalEngine"

import * as S from "./UI"
import { cleanCommand, hasSelection } from "./helpers"

export const Input = ({
	instance,
	known,
	value = "",
	// a click count, so the zero of a shell nobody has clicked yet is a
	// number and not an absence
	forceFocus = 0,
	options,
	onValidate = () => {},
	onCallPrevious = () => {},
	onCallNext = () => {},
}: InputProps) => {
	const [inputValue, setInputValue] = useState<string>(value)
	const [predict, setPredict] = useState<string>("")
	const [nbsLetters, setNbsLetters] = useState<number>(0)
	const [prevValue, setPrevValue] = useState<string>(value)
	const ref = useRef<HTMLInputElement>(null)

	// the theme of this terminal, off the provider its terminal put up
	const worn = useTheme()

	// a mouse button held down may well be a selection under way
	const pressed = useRef<boolean>(false)

	/**
	 * The option is read at the moment the focus is played, and not when it
	 * changes: it is a guard, not a trigger. Read through a ref, turning it
	 * `true` mid-session does not take the focus back on its own — on a
	 * phone that would open the keyboard without anything being touched —
	 * and the mouse listeners mount once and for all.
	 */
	const keyboardOnFocus = useRef<boolean>(options.keyboardOnFocus)
	useEffect(() => {
		keyboardOnFocus.current = options.keyboardOnFocus
	}, [options.keyboardOnFocus])

	// the input is local, but the history imposes its value: it realigns
	// during the render when the parent pushes a new one
	if (prevValue !== value) {
		setPrevValue(value)
		setInputValue(value)
		setNbsLetters(value.length)
	}

	const handleKeyUp = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			const commandPattern = cleanCommand(e.currentTarget.value)
			const autocomplete = autocompleteCommand({
				commands: known,
				startCommand: commandPattern,
			})

			setNbsLetters(e.currentTarget.value.length)
			setPredict(autocomplete)

			if (commandPattern === "") {
				e.preventDefault()
			} else if (e.key === "Enter" && autocomplete !== "" && isMobile) {
				setInputValue(autocomplete + " ")
				setNbsLetters(autocomplete.length + 1)
				setPredict("")
			} else if (e.key === "Enter") {
				onValidate(commandPattern)
				setInputValue("")
				setNbsLetters(0)
				setPredict("")
			} else if (e.key === "Tab" && autocomplete !== "") {
				setInputValue(autocomplete + " ")
				setNbsLetters(autocomplete.length + 1)
				setPredict("")
			}
		},
		[onValidate, known]
	)

	const handleKeyDown = useCallback(
		(e: KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "ArrowUp") {
				onCallPrevious()
				e.preventDefault()
			} else if (e.key === "ArrowDown") {
				onCallNext()
				e.preventDefault()
			} else if (e.key === "Tab") {
				e.preventDefault()
			}
		},
		[onCallPrevious, onCallNext]
	)

	/**
	 * The focus at mount, and only for a shell that takes it back anyway: a
	 * terminal that has given it up must not steal it from the page around
	 * it. It is mounted again more often than it looks — a preview keyed on
	 * what is being edited remounts at every keystroke — and each time it
	 * would empty the field being filled.
	 */
	useEffect(() => {
		if (options.keyboardOnFocus) ref?.current?.focus()
	}, [options.keyboardOnFocus])

	/**
	 * The focus comes back when the button is released, and only if nothing
	 * is selected: taking it back on the blur, so on the press, cancelled
	 * any selection of text with the mouse.
	 */
	useEffect(() => {
		const handleDown = () => {
			pressed.current = true
		}

		const handleUp = () => {
			pressed.current = false

			if (!keyboardOnFocus.current) return
			if (document.activeElement === ref.current) return
			if (hasSelection()) return

			ref.current?.focus()
		}

		document.addEventListener("mousedown", handleDown)
		document.addEventListener("mouseup", handleUp)

		return () => {
			document.removeEventListener("mousedown", handleDown)
			document.removeEventListener("mouseup", handleUp)
		}
	}, [])

	/**
	 * A click on the terminal hands the keyboard over, whatever
	 * `keyboardOnFocus` says: the option guards the focus taken back from
	 * the rest of the page, and a click aimed at the shell is asking for it
	 * plainly. Turning it off is for a page that is not the shell — a form
	 * around it — and even there, clicking the terminal means typing in it.
	 */
	useEffect(() => {
		// the counter starts at zero and moves on a click alone: at mount
		// there has been none, and the focus is not this effect's to take
		if (forceFocus > 0) ref?.current?.focus()
	}, [forceFocus])

	/**
	 * The language is forced, and not read off the shell in play: `t()`
	 * finds one while a command runs, and this is a render. The input holds
	 * its options, the language among them, so it says which one it speaks.
	 */
	const predictDisplay = withInstance(instance, () =>
		t(
			"input.predict",
			{ word: predict, key: isMobile ? "ENTER" : "TAB" },
			options.lang
		)
	)

	// an id of its own, and not a constant: two terminals on the same page
	// would otherwise describe their field with the hint of the other
	const hintId = useId()

	return (
		<S.Container data-tutorial="input">
			{/* the prompt is a drawing: read out, the flower of the theme
			    becomes "cherry blossom" before every line */}
			<S.Lambda aria-hidden="true">{worn.prompt}</S.Lambda>
			<S.CustomInput
				$nbsLetters={nbsLetters}
				ref={ref}
				value={inputValue}
				// the prompt names nothing for whoever does not see it
				aria-label={withInstance(instance, () =>
					t("input.label", undefined, options.lang)
				)}
				// the hint of the completion, read after the field
				aria-describedby={predict !== "" ? hintId : undefined}
				spellCheck="false"
				// `off`, and not `false`: an unknown value falls back on `on`,
				// and the browser was suggesting what had been typed elsewhere
				autoComplete="off"
				autoCapitalize="off"
				autoCorrect="off"
				onBlur={() => {
					// during a held click, the focus waits for the release
					if (options.keyboardOnFocus && !pressed.current) {
						ref?.current?.focus()
					}
				}}
				onKeyDown={handleKeyDown}
				onKeyUp={handleKeyUp}
				onChange={e => {
					setInputValue(e.currentTarget.value)
				}}
			/>
			{predict !== "" && <S.Predict id={hintId}>{predictDisplay}</S.Predict>}
		</S.Container>
	)
}
