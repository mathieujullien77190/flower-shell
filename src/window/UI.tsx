import styled from "styled-components"
import { Mode, Pos, WindowStart } from "./types"
import { colors, fonts, windowColors } from "@theme"
import {
	FULL,
	ANIM_TIME,
	CASCADE,
	MEDIUM_MARGIN,
	MEDIUM_SIZE,
	TOP_LAYER,
} from "./constants"

type ContainerProps = {
	$mode: Mode
	$rank: number
	$drag: Pos
	$followMouse: boolean
	$layer: number
	/** the corner of the desktop the window opens on */
	$start: WindowStart
	/** the distance to the edge, in CSS */
	$margin: string
	/**
	 * Height kept free at the bottom of the container, in CSS. The desktop
	 * puts its taskbar there; without it, the window would go under.
	 */
	$bottomInset: string
}

/**
 * Place of the window, as a percentage: no measurement of the desktop is
 * needed, and it follows its resizing. The cascade and the dragging add up
 * in pixels.
 *
 * It comes out as an inline style, not in the CSS: styled-components makes
 * one class per interpolated value, and a drag would produce one per pixel
 * travelled — the console ended up saying so.
 *
 * The move goes through top/left and not through a transform: a transformed
 * ancestor becomes the frame of reference of the position: fixed it
 * contains, which shifted the full screen canvas of stux.
 */
/**
 * The share of the desktop left in front of the window, as a percentage,
 * for each of the words of `start`. The medium size takes `MEDIUM_SIZE`:
 * centered, it leaves half of the rest on each side — that is
 * `MEDIUM_MARGIN`, and that is the place the window has always had.
 */
const ANCHOR = {
	left: 0,
	top: 0,
	center: MEDIUM_MARGIN,
	right: 100 - MEDIUM_SIZE,
	bottom: 100 - MEDIUM_SIZE,
} as const

/**
 * The distance to the edge, applied on the side the window is set on: it
 * moves it away from the edge `start` brings it to. A centered axis has no
 * edge to flee, so it means nothing there.
 */
const offset = (word: keyof typeof ANCHOR, $margin: string) => {
	if (word === "center") return ""

	return ` ${word === "left" || word === "top" ? "+" : "-"} ${$margin}`
}

const place = ({ $mode, $rank, $drag, $start, $margin }: ContainerProps) => {
	if ($mode === "full") return { top: 0, left: 0 }

	const shift = $rank * CASCADE
	const [x, y] = $start.split("-") as [
		"left" | "center" | "right",
		"top" | "center" | "bottom",
	]

	return {
		top: `calc(${ANCHOR[y]}%${offset(y, $margin)} + ${shift + $drag.y}px)`,
		left: `calc(${ANCHOR[x]}%${offset(x, $margin)} + ${shift + $drag.x}px)`,
	}
}

export const Container = styled.div.attrs<ContainerProps>(props => ({
	style: place(props),
}))`
	position: absolute;

	${({ $mode, $bottomInset }) => {
		const side = $mode === "full" ? 100 : MEDIUM_SIZE
		return `
			width: calc(${side}% - ${FULL.borderSize} * 2);
			height: calc(${side}% - ${$bottomInset} - ${FULL.borderSize} * 2);
		`
	}}

	border-style: solid;
	border-width: ${FULL.borderSize};
	border-color: ${() => windowColors().border};
	font-family: ${() => fonts().window};
	background-color: ${() => windowColors().content};
	color: ${() => windowColors().text};
	overflow: hidden;
	font-weight: ${FULL.fontWeight};
	z-index: ${({ $layer }) => $layer || TOP_LAYER};

	/* during the drag, the transition would let go of the cursor: only the
	   width and the height stay animated */
	transition: ${({ $followMouse }) =>
		$followMouse
			? `width ${ANIM_TIME / 1000}s ease-out, height ${
					ANIM_TIME / 1000
				}s ease-out`
			: `all ${ANIM_TIME / 1000}s ease-out`};

	${({ $mode }) => {
		if ($mode === "medium")
			return `
				box-shadow: 3px 2px 4px #00000041;
				border-radius: 4px;
			`
	}}
`

export const topBar = styled.div<{ $move: boolean }>`
	height: 15px;
	background-color: ${() => windowColors().titleBar};
	border-bottom-style: solid;
	border-bottom-width: ${FULL.borderSize};
	border-bottom-color: ${() => windowColors().border};
	display: flex;
	align-items: center;
	padding: ${FULL.padding};
	/* the cursor says what the bar does: nothing, when it does not move */
	cursor: ${({ $move }) => ($move ? "move" : "default")};

	/* The bar is what one grabs to move the window: without this the drag
	   selects the title, which stays highlighted once the mouse is
	   released. The buttons inherit it, and there is nothing to copy in a
	   cross either.

	   The bar alone is aimed at: the output of the terminal does get
	   selected — that is even what reveals the invisible marker. */
	user-select: none;
`

export const Content = styled.div`
	overflow-y: auto;
	height: ${`calc(100% - ${FULL.padding} * 2 - 25px)`};
	padding: ${FULL.padding};
	background-color: ${() => colors().background};

	&::-webkit-scrollbar {
		-webkit-appearance: none;
		width: 12px;
		background-color: #f2e7c8;
		border-radius: 2px;
	}

	&::-webkit-scrollbar-thumb {
		background-color: #776b6d;
		border-radius: 2px;
		border-top: solid 1px black;
		border-bottom: solid 1px black;
	}
`

export const Title = styled.div`
	width: 100%;
	font-weight: bold;
	display: flex;
	justify-content: start;
	align-items: center;
`

export const Actions = styled.div`
	margin: 0 auto;
	display: flex;
	justify-content: center;
	align-items: center;
	span {
		cursor: pointer;
		font-size: 14px;
		margin-top: -1px;
		font-weight: bold;
		padding: 0 6px;
	}
`

/**
 * The content, at full size. It used to wait for the window to have reached
 * its size before showing itself, fading in: the window now reaches its
 * size in one go, and there is nothing left to wait for.
 */
export const Wrapper = styled.div`
	width: 100%;
	height: 100%;
`
