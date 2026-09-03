import styled from "styled-components"
import { colors, fonts, scrollbar } from "@theme"

export const TerminalContainer = styled.div<{ $size: number }>`
	background: ${() => colors().background};
	color: ${() => colors().textColor};
	font-family: ${() => fonts().shell};
	width: 100%;

	/* the theme sets an inner padding: it is taken out of the 100% of width
	   and height, or the container overflows whatever holds it */
	box-sizing: border-box;

	/* The terminal scrolls itself: it takes the height it is given and keeps
	   the overflow inside, scrollbar included. Its own height, and not that
	   of the output: a scroll box has to be shorter than what it holds.

	   A parent of no set height leaves this height at auto — the shell then
	   grows with the output and nothing scrolls. */
	height: 100%;
	overflow-y: auto;

	/* the scrollbar wears the theme: the thumb and its groove, and a thin
	   bar — a terminal is read, not dragged around */
	scrollbar-color: ${() => scrollbar().color};
	scrollbar-width: ${() => scrollbar().width};

	/* size of the shell, inherited by the commands and the input: the theme
	   carries it, so one made for a screen read from far raises it */
	font-size: ${({ $size }) => $size}px;

	/* frame of reference of the cqw units: the ascii art is sized on the
	   window of the OS and not on the one of the browser */
	container-type: inline-size;

	/* Under 700px wide, the font follows the window instead of letting the
	   lines wrap: the divisor is 700 / size, so the value is exactly the
	   size of the theme at 700px and shrinks below. No step, no jump.

	   The rule aims at the children: cqw is measured on the closest
	   container, and an element cannot measure itself on itself. */
	& > * {
		font-size: clamp(
			7px,
			calc(100cqw / ${({ $size }) => 700 / $size}),
			${({ $size }) => $size}px
		);
	}
`

/**
 * The played commands, grouped so the output can be named and announced on
 * its own — the input is not part of what a screen reader re-reads. It adds
 * no style: the container it sits in keeps them all.
 */
export const History = styled.div``
