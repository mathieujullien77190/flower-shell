import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import { baseCommands } from "../../commands/base"
import { test } from "../../commands/test"
import { fresh } from "../decorators"
import { prose } from "../i18n"
import { source } from "../source"

const meta: Meta<typeof Shell> = {
	title: "Shell/In a window",
	component: Shell,
	parameters: prose({
		en: `
The \`window\` prop puts the shell in a frame without assembling one: the shell
provides the container that bounds the movement and scrolls itself through the
frame content, so \`scrollRef\` has nothing left to say.

Everything the frame can do is in the object. Drag it by the title bar,
double-click to fill the space, close it with the cross — then take those away
one by one with \`move\`, \`canExpand\` and \`canClose\`.

\`start\` is where it opens: the horizontal first, then the vertical, out of
\`left | center | right\` and \`top | center | bottom\`. \`center-center\` is the
default, and the place the frame has always taken. \`margin\` then holds it off
the edges it was sent to — a CSS length, zero by default, and nothing at all
on an axis that is centred.

The shell only sizes itself on what holds it — the story gives the page a
height and a background, the package imposes neither.
`,
		fr: `
La prop \`window\` pose le shell dans un cadre sans avoir à en assembler un :
le shell fournit le conteneur qui borne le déplacement et se fait défiler par
le contenu du cadre, si bien que \`scrollRef\` n'a plus rien à dire.

Tout ce que le cadre sait faire tient dans l'objet. Glissez-le par sa barre de
titre, double-cliquez pour qu'il prenne toute la place, fermez-le par la croix
— puis retirez-lui ces trois-là une à une avec \`move\`, \`canExpand\` et
\`canClose\`.

\`start\` est l'endroit où il s'ouvre : l'horizontale d'abord, la verticale
ensuite, parmi \`left | center | right\` et \`top | center | bottom\`.
\`center-center\` est la valeur par défaut, et la place que le cadre a toujours
prise. \`margin\` l'écarte ensuite des bords où on l'a envoyé — une longueur
CSS, zéro par défaut, et rien du tout sur un axe centré.

Le shell ne prend que la taille de ce qui le tient — la story donne à la page
une hauteur et un fond, le paquet n'impose ni l'une ni l'autre.
`,
	}),
	decorators: [
		fresh,
		Story => (
			<div style={{ height: "100vh", background: "#84787A" }}>
				<Story />
			</div>
		),
	],
}

export default meta

export const Windowed: StoryObj<typeof Shell> = {
	name: "In a window",
	parameters: {
		layout: "fullscreen",
		...source(`
import { Shell, baseCommands, test } from "flower-shell"

// the object is the whole frame: nothing else to wire, no ref to pass
<Shell
	commands={{ ...baseCommands, test }}
	initialCommands={["title", "welcome"]}
	window={{
		title: "flower-shell",
		// the top right corner, kept 24px off both edges
		start: "right-top",
		margin: "24px",
		move: true,
		canExpand: true,
		canClose: true,
		onClose: () => console.log("closed"),
	}}
/>
`),
	},
	args: {
		commands: { ...baseCommands, test },
		initialCommands: ["title", "welcome"],
		window: {
			title: "flower-shell",
			start: "right-top",
			margin: "24px",
			move: true,
			canExpand: true,
			canClose: true,
			// eslint-disable-next-line no-console
			onClose: () => console.log("closed"),
		},
	},
}

/**
 * The same frame with everything taken away: it cannot be moved, cannot be
 * expanded, cannot be closed. The title bar loses its cursor with the
 * dragging, and the actions are empty — a fixed panel, opened bottom left.
 *
 * And no `margin`, which is the default: flush into the corner. Compare with
 * the 24px of the story above.
 */
export const Fixed: StoryObj<typeof Shell> = {
	name: "In a fixed window",
	parameters: {
		layout: "fullscreen",
		...source(`
<Shell
	commands={{ ...baseCommands, test }}
	initialCommands={["title", "welcome"]}
	window={{
		title: "flower-shell",
		start: "left-bottom",
		move: false,
		canExpand: false,
		canClose: false,
	}}
/>
`),
	},
	args: {
		commands: { ...baseCommands, test },
		initialCommands: ["title", "welcome"],
		window: {
			title: "flower-shell",
			start: "left-bottom",
			move: false,
			canExpand: false,
			canClose: false,
		},
	},
}
