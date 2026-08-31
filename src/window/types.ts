import { ReactNode, RefObject } from "react"

export type Pos = { x: number; y: number }
export type Mode = "medium" | "full"

/**
 * The corner of the desktop the window opens on: the horizontal, then the
 * vertical. `center-center` is the default place, the one it has always
 * had.
 */
export type WindowStart =
	| "left-top"
	| "center-top"
	| "right-top"
	| "left-center"
	| "center-center"
	| "right-center"
	| "left-bottom"
	| "center-bottom"
	| "right-bottom"

export type WindowProps = {
	show: boolean
	container: RefObject<HTMLDivElement | null>
	title?: string
	/** mark of the title bar, aimed at by the guided tour */
	tutorial?: string
	/** mark of the whole frame, to lay a layer over it */
	mark?: string
	/** stacking floor: the window in the foreground has the highest */
	layer?: number
	/** rank in the cascade, so as not to open on top of the previous one */
	rank?: number
	/**
	 * Height kept free at the bottom of the container, in CSS. The desktop
	 * puts its taskbar there; without it, the window would go under.
	 */
	bottomInset?: string
	/**
	 * Full and not resizable. It is up to whoever displays it to decide
	 * when: a small screen, a reading mode, a preference. The package sets
	 * no threshold.
	 */
	compact?: boolean
	/** it is dragged by its title bar; true by default */
	move?: boolean
	/** the corner it opens on; `center-center` by default */
	start?: WindowStart
	/**
	 * The distance to the edge, in CSS: `"24px"`, `"2rem"`, `"3%"`. It moves
	 * the window away from the edge `start` brings it to, and so applies
	 * neither to centered axes nor to a full window. Zero by default.
	 */
	margin?: string
	/**
	 * The expand button, and the double click on the bar. False takes it
	 * away and the window keeps its size. `compact` wins: full, it has
	 * nothing left to expand.
	 */
	canExpand?: boolean
	/** the close cross; true by default */
	canClose?: boolean
	/**
	 * It does not close by itself: the cross warns, and it is `show` that
	 * makes it disappear. It is up to whoever displays it to turn it false.
	 */
	onClose?: () => void
	/** the window asks for the foreground */
	onFocus?: () => void
	children: ReactNode
}
