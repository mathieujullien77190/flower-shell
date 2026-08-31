export const FULL = {
	padding: "4px",
	borderSize: "2px",
	fontWeight: "bold",
}

export const LIGHT = {
	padding: "2px",
	borderSize: "1px",
	fontWeight: "normal",
}

export const ANIM_TIME = 300

// size of the medium window, as a percentage of the desktop: setting it in
// CSS avoids measuring the desktop, and the window follows the resizing
export const MEDIUM_MARGIN = 15
export const MEDIUM_SIZE = 70

// shift from one window to the next as they open, in pixels: without it
// they land on the same spot and hide each other perfectly
export const CASCADE = 26

// floor of the window in the foreground; the others go one step down and
// stay under the modals, which are at 10
export const TOP_LAYER = 9
