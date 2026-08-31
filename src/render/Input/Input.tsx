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

import { getCommands } from "@state/registry"
import { autocompleteCommand } from "@engine/terminalEngine"

import * as S from "./UI"
import { cleanCommand, hasSelection } from "./helpers"

export const Input = ({
	value = "",
	forceFocus,
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
				commands: getCommands(),
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
		[onValidate]
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

	useEffect(() => {
		ref?.current?.focus()
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

	useEffect(() => {
		if (keyboardOnFocus.current) ref?.current?.focus()
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
