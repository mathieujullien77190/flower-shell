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

	/* Un champ de saisie n'herite pas de la police de son parent : sans
	   cette ligne il retombe sur celle du navigateur, plus petite que la
	   taille du shell, et la ligne en cours ne fait plus la meme hauteur
	   que celles deja jouees. La largeur en ch la suit. */
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
