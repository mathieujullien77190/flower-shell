import React, { useState } from "react"

import { TerminalProps } from "./types"

import Input, { hasSelection } from "@render/Input"
import Command from "@render/Command"

import { useCommands, useThemeName } from "@state/context"
import { container } from "@theme"
import { findCommand } from "@engine/terminalEngine"

import * as S from "./UI"

export const Terminal = ({
	boxRef,
	commands,
	currentCommand,
	options,
	onRendered,
	onAnimateCommand,
	onSendCommand,
	onSendRestrictedCommand,
	onSendPreviousCommand,
	onSendNextCommand,
}: TerminalProps) => {
	const [forceFocus, setForceFocus] = useState<number>(0)

	// subscription to the theme: on a change, the container reads colors() again
	const themeName = useThemeName()
	const known = useCommands()

	return (
		<S.TerminalContainer
			ref={boxRef}
			data-theme={themeName}
			// the style of the container comes from the theme: set inline, it
			// covers the base style without the consumer having to fight
			// specificity
			style={container()}
			onClick={() => {
				// a click that has just selected text does not hand back to the
				// input: the focus would wipe the selection out
				if (!hasSelection()) setForceFocus(prev => prev + 1)
			}}
		>
			{commands
				.filter(command => command.visible)
				.map((command, i, all) => {
					const prevIsRendered = i === 0 ? true : all[i - 1].isRendered
					const baseCommand = findCommand({
						commands: known,
						name: command.name,
						restricted: command.restricted,
					})

					return (
						<Command
							animation={options.animation}
							command={command}
							baseCommand={baseCommand}
							key={command.id}
							canRendered={prevIsRendered}
							onRendered={() => onRendered(command.id)}
							onAnimate={onAnimateCommand}
							onClickCommand={(name, args) =>
								onSendRestrictedCommand(`${name} ${args.join(" ")}`)
							}
						/>
					)
				})}

			<Input
				forceFocus={forceFocus}
				options={options}
				value={currentCommand?.pattern}
				onValidate={onSendCommand}
				onCallPrevious={onSendPreviousCommand}
				onCallNext={onSendNextCommand}
			/>
		</S.TerminalContainer>
	)
}
