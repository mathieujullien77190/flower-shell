import styled from "styled-components"
import { colors, fonts } from "@theme"

export const TerminalContainer = styled.div`
	background: ${() => colors().background};
	color: ${() => colors().textColor};
	font-family: ${() => fonts().shell};
	width: 100%;

	/* the theme sets an inner padding: it is taken out of the 100% of width
	   and height, or the container overflows whatever holds it */
	box-sizing: border-box;

	/* min-height and not height: the background has to go down with the
	   output. At a fixed height, anything past the parent is drawn outside
	   the background, on the white of the page. */
	min-height: 100%;

	/* size of the shell, inherited by the commands and the input */
	font-size: 16px;

	/* frame of reference of the cqw units: the ascii art is sized on the
	   window of the OS and not on the one of the browser */
	container-type: inline-size;

	/* Under 700px wide, the font follows the window instead of letting the
	   lines wrap: 700 / 16 = 43.75, so 100cqw / 43.75 is exactly 16px at
	   700px and shrinks below. No step, no jump.

	   The rule aims at the children: cqw is measured on the closest
	   container, and an element cannot measure itself on itself. */
	& > * {
		font-size: clamp(7px, calc(100cqw / 43.75), 16px);
	}
`
