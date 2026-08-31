import { useEffect, useRef, useState, Ref, forwardRef } from "react"
import { WindowProps, Pos, Mode } from "./types"
import * as S from "./UI"
import { TOP_LAYER } from "./constants"
import { clampDrag } from "./helpers"

const NO_DRAG: Pos = { x: 0, y: 0 }

const BaseWindow = (
	{
		show,
		container,
		children,
		title = "Untitled",
		tutorial,
		mark,
		layer = TOP_LAYER,
		rank = 0,
		bottomInset = "0px",
		compact = false,
		move = true,
		start = "center-center",
		margin = "0px",
		canExpand = true,
		canClose = true,
		onFocus = () => {},
		onClose = () => {},
	}: WindowProps,
	ref: Ref<HTMLDivElement>
) => {
	const [userMode, setUserMode] = useState<Mode>("medium")

	// in compact mode the window stays full and not resizable
	const mode: Mode = compact ? "full" : userMode

	// full, it has nothing left to expand: `compact` wins over the choice
	const expandable = canExpand && !compact

	/**
	 * Move applied by the mouse, in pixels, on top of a base position in
	 * percentage. Measuring the desktop to place the window took an effect
	 * and a setState on mount; the percentage gives the same placement,
	 * follows the resizing, and does without both.
	 */
	const [drag, setDrag] = useState<Pos>(NO_DRAG)
	const [followMouse, setFollowMouse] = useState<boolean>(false)

	const boxRef = useRef<HTMLDivElement>(null)

	const handleResize = () => {
		// changing size puts the window back in its place: the earlier move
		// means nothing any more at the new size
		setDrag(NO_DRAG)
		setUserMode(prev => (prev === "full" ? "medium" : "full"))
	}

	/**
	 * The cross warns, and nothing more: it is `show` that makes the window
	 * disappear, and it comes from outside. It straightens itself on the way
	 * — moved, expanded, it would reopen just as it was left.
	 */
	const handleClose = () => {
		setDrag(NO_DRAG)
		setUserMode("medium")
		onClose()
	}

	useEffect(() => {
		if (!followMouse) return

		const handlerMousemove = (event: MouseEvent) => {
			setDrag(prev => ({
				x: prev.x + event.movementX,
				y: prev.y + event.movementY,
			}))
		}

		/**
		 * The release rarely lands on the title bar, often outside the page:
		 * without a listener at document level, the window would stay stuck
		 * to the cursor. The blur covers the mouse released outside of the
		 * tab, which emits no mouseup.
		 */
		const handlerMouseup = () => {
			setFollowMouse(false)

			const area = container.current?.getBoundingClientRect()
			const box = boxRef.current?.getBoundingClientRect()
			if (area && box) setDrag(prev => clampDrag(prev, box, area))
		}

		document.addEventListener("mousemove", handlerMousemove)
		document.addEventListener("mouseup", handlerMouseup)
		window.addEventListener("blur", handlerMouseup)

		return () => {
			document.removeEventListener("mousemove", handlerMousemove)
			document.removeEventListener("mouseup", handlerMouseup)
			window.removeEventListener("blur", handlerMouseup)
		}
	}, [followMouse, container])

	return (
		<>
			{show && (
				<S.Container
					data-window={mark}
					ref={boxRef}
					$mode={mode}
					$rank={rank}
					$drag={drag}
					$followMouse={followMouse}
					$layer={layer}
					$bottomInset={bottomInset}
					$start={start}
					$margin={margin}
					onMouseDown={onFocus}
				>
					<S.topBar
						data-tutorial={tutorial}
						$move={move}
						onDoubleClick={expandable ? handleResize : undefined}
						onMouseDown={() => {
							if (move && mode !== "full") setFollowMouse(true)
						}}
					>
						<S.Title>{title}</S.Title>
						<S.Actions>
							{expandable && (
								<span onClick={handleResize}>
									{mode === "full" ? "-" : "+"}
								</span>
							)}
							{canClose && <span onClick={handleClose}>x</span>}
						</S.Actions>
					</S.topBar>
					<S.Content ref={ref}>
						<S.Wrapper>{children}</S.Wrapper>
					</S.Content>
				</S.Container>
			)}
		</>
	)
}

export const Window = forwardRef<HTMLDivElement, WindowProps>(BaseWindow)
