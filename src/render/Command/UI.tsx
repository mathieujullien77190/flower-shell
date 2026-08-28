import styled from "styled-components"
import { colors } from "../../theme"

export const CmdContainer = styled.div`
	display: flex;
	flex-direction: column;
`

export const CmdLine = styled.div<{ $restricted: boolean }>`
	font-weight: bold;

	span {
		color: ${({ $restricted }) =>
			$restricted ? colors().restrictedColor : colors().cmdColor};
	}
`

export const CmdResult = styled.pre`
	white-space: pre-wrap;
	margin: 0;
	margin-bottom: 1rem;
`
