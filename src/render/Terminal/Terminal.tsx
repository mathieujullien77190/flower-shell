import React, { useState } from "react"

import { TerminalProps } from "./types"

import Input, { hasSelection } from "@render/Input"
import Command from "@render/Command"

import { getCommands } from "@state/registry"
import { useThemeMode } from "@state/store"
import { findCommand } from "@engine/terminalEngine"

import * as S from "./UI"

export const Terminal = ({
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

	// abonnement au theme : au changement, le conteneur relit colors()
	const themeMode = useThemeMode()

	return (
		<S.TerminalContainer
			data-theme={themeMode}
			onClick={() => {
				// un clic qui vient de selectionner du texte ne rend pas la main
				// a la saisie : le focus effacerait la selection
				if (!hasSelection()) setForceFocus(prev => prev + 1)
			}}
		>
			{commands
				.filter(command => command.visible)
				.map((command, i, all) => {
					const prevIsRendered = i === 0 ? true : all[i - 1].isRendered
					const baseCommand = findCommand({
						commands: getCommands(),
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
