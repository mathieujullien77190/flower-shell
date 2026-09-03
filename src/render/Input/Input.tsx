import React, {
	useCallback,
	useState,
	KeyboardEvent,
	useRef,
	useEffect,
} from "react"
import { InputProps } from "./types"
import { isMobile } from "react-device-detect"

import { theme } from "@theme"

import { useCommands } from "@state/context"
import { autocompleteCommand } from "@engine/terminalEngine"

import * as S from "./UI"
import { cleanCommand, hasSelection } from "./helpers"

export const Input = ({
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

	// the commands of this shell, for the autocompletion alone
	const known = useCommands()

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

	const predictDisplay = `( ${predict}? appuyez sur [${
		isMobile ? "ENTER" : "TAB"
	}] )`

	return (
		<S.Container data-tutorial="input">
			<S.Lambda>{theme().prompt}</S.Lambda>
			<S.CustomInput
				$nbsLetters={nbsLetters}
				ref={ref}
				value={inputValue}
				spellCheck="false"
				autoComplete="false"
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
			{predict !== "" && <S.Predict>{predictDisplay}</S.Predict>}
		</S.Container>
	)
}
