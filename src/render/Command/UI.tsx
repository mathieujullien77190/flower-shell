import styled from "styled-components"

export const CmdContainer = styled.div`
	display: flex;
	flex-direction: column;
`

export const CmdLine = styled.div<{ $restricted: boolean }>`
	font-weight: bold;

	span {
		color: ${({ $restricted, theme }) =>
			$restricted ? theme.colors.restrictedColor : theme.colors.cmdColor};
	}
`

export const CmdResult = styled.pre`
	white-space: pre-wrap;
	margin: 0;
	margin-bottom: 1rem;
`
