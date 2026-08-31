import React, { useEffect } from "react"
import { CommandProps } from "./types"

import { theme } from "@theme"

import * as S from "./UI"
import { highlight } from "./helpers"
import { useDisplayByLetter } from "./hooks"

const Command = ({
	canRendered,
	command,
	baseCommand,
	animation,
	onRendered = () => {},
	onAnimate = () => {},
	onClickCommand = () => {},
}: CommandProps) => {
	// the text is frozen: `t()` translated when the command executed
	const name = command.name
	const args = command.args.map(arg => `${arg}`).join(" ")

	/**
	 * Written once already, it is laid down as it is. The terminal can be
	 * unmounted then mounted again — a window one closes and reopens — while
	 * the history lives at module level: without this everything would be
	 * rewritten letter by letter, and the logo takes twenty seconds.
	 *
	 * This wins over `display.animation`: a command asking for its animation
	 * asks for it for the time it plays, not for the renders that follow of
	 * a text already read.
	 */
	const written = command.isRendered

	const displayResult = useDisplayByLetter({
		baseTxt: command.result,
		canRendered,
		animation: written
			? false
			: baseCommand?.display?.animation !== undefined
				? baseCommand?.display?.animation
				: animation,
		reverse: baseCommand?.display?.reverse,
		stepTime: baseCommand?.display?.stepTime,
		stepSize: baseCommand?.display?.stepSize,
	})

	useEffect(() => {
		if (displayResult.finish) onRendered()
		onAnimate()
	}, [displayResult, onRendered, onAnimate])

	return (
		<>
			{canRendered && (
				<S.CmdContainer
					data-tutorial={`cmd-${command.name}`}
					style={baseCommand?.display?.style || {}}
				>
					{!baseCommand?.display?.hideCmd && (
						<S.CmdLine $restricted={command.restricted}>
							<strong>{theme().prompt}</strong>{" "}
							<span>
								{name} {args}
							</span>
						</S.CmdLine>
					)}

					{displayResult.txt !== "" && (
						<S.CmdResult style={baseCommand?.display?.stylePre || {}}>
							{baseCommand?.display?.highlight
								? baseCommand?.display?.highlight(displayResult.txt)
								: highlight(displayResult.txt, (name, args) => {
										onClickCommand(name, args)
									})}
						</S.CmdResult>
					)}

					{baseCommand?.JSX && baseCommand.JSX({ args: command.args })}
				</S.CmdContainer>
			)}
		</>
	)
}

export const MemoCommand = React.memo(Command, (prevProps, nextProps) => {
	return (
		prevProps.command.visible === nextProps.command.visible &&
		prevProps.canRendered === nextProps.canRendered
	)
})
