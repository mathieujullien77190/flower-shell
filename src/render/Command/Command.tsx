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
	// le texte est fige : `t()` a traduit quand la commande s'est executee
	const name = command.name
	const args = command.args.map(arg => `${arg}`).join(" ")

	const displayResult = useDisplayByLetter({
		baseTxt: command.result,
		canRendered,
		animation:
			baseCommand?.display?.animation !== undefined
				? baseCommand?.display?.animation
				: animation,
		reverse: baseCommand?.display?.reverse,
		stepTime: baseCommand?.display?.stepTime,
		stepSize: baseCommand?.display?.stepSize,
	})

	useEffect(() => {
		if (displayResult.finish) onRendered()
		onAnimate()
	}, [displayResult, onRendered])

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

					<S.CmdResult style={baseCommand?.display?.stylePre || {}}>
						{baseCommand?.display?.highlight
							? baseCommand?.display?.highlight(displayResult.txt)
							: highlight(displayResult.txt, (name, args) => {
									onClickCommand(name, args)
								})}
					</S.CmdResult>

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
