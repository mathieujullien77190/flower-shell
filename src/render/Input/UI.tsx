import styled from "styled-components"
import { colors, fonts } from "@theme"

export const CustomInput = styled.input<{ $nbsLetters: number }>`
	background-color: ${() => colors().background};
	border: none;
	outline: none;
	color: ${() => colors().textColor};
	padding: 0;
	margin: 0;
	font-family: ${() => fonts().shell};

	/* An input field does not inherit the font of its parent: without this
	   line it falls back on the one of the browser, smaller than the size
	   of the shell, and the current line no longer has the same height as
	   the ones already played. The width in ch follows it. */
	font-size: inherit;
	width: ${({ $nbsLetters }) => $nbsLetters + 1}ch;
	margin-left: 8px;
`

export const Container = styled.div`
	display: flex;
`

export const Predict = styled.span`
	opacity: 0.5;
`

export const Lambda = styled.strong``
