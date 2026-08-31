import { Pos } from "./types"

/**
 * Corrects the move to bring the window back inside the desktop.
 *
 * A window released half outside keeps its title bar out of reach: it
 * becomes impossible to grab again.
 */
export const clampDrag = (drag: Pos, box: DOMRect, area: DOMRect): Pos => {
	const out = (before: number, after: number) =>
		Math.max(0, before) - Math.max(0, after)

	return {
		x: drag.x + out(area.left - box.left, box.right - area.right),
		y: drag.y + out(area.top - box.top, box.bottom - area.bottom),
	}
}
