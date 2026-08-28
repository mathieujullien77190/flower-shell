import styled from "styled-components"
import { colors, fonts } from "../../theme"

export const CustomInput = styled.input<{ $nbsLetters: number }>`
	background-color: ${colors().background};
	border: none;
	outline: none;
	color: white;
	padding: 0;
	margin: 0;
	font-family: ${fonts().shell};
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
