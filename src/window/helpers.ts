import { Pos } from "./types"

/**
 * Corrige le deplacement pour ramener la fenetre dans le bureau.
 *
 * Une fenetre lachee a moitie dehors garde sa barre de titre hors de
 * portee : elle devient impossible a rattraper.
 */
export const clampDrag = (drag: Pos, box: DOMRect, area: DOMRect): Pos => {
	const out = (before: number, after: number) =>
		Math.max(0, before) - Math.max(0, after)

	return {
		x: drag.x + out(area.left - box.left, box.right - area.right),
		y: drag.y + out(area.top - box.top, box.bottom - area.bottom),
	}
}
