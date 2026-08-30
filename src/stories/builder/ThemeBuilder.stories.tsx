import type { Meta, StoryObj } from "@storybook/react-vite"

import { prose } from "../i18n"
import { renderOnly } from "../source"
import { ThemeBuilder } from "./ThemeBuilder"

const meta: Meta<typeof ThemeBuilder> = {
	title: "Shell/Theme builder",
	component: ThemeBuilder,
	parameters: prose({
		en: `
Pick a theme to start from, move the colors, and read the result twice: once
as a shell, once as the code that produces it. The block at the bottom is the
pair to paste: the theme itself, and the \`themes\` entry plus the \`theme\`
name that mount it.

The preview is the real thing: a \`Shell\` in a \`Window\`, wearing the draft,
opening on \`test\` — the command that prints every color of the theme. Both
palettes are live, the terminal one and the window frame one.

It remounts at every touch of a picker: a shell already mounted would not
replay its opening, and the theme lives at module level. Animation is off here
alone, so the palette lands with the color and not a second later.
`,
		fr: `
Choisissez un thème de départ, déplacez les couleurs, et lisez le résultat
deux fois : une fois en shell, une fois en code qui le produit. Le bloc du bas
est la paire à coller : le thème lui-même, et l'entrée \`themes\` plus le nom
\`theme\` qui le montent.

L'aperçu est le vrai : un \`Shell\` dans une \`Window\`, portant le brouillon,
ouvrant sur \`test\` — la commande qui affiche toutes les couleurs du thème.
Les deux palettes sont vivantes, celle du terminal et celle du cadre.

Il remonte à chaque touche d'un picker : un shell déjà monté ne rejouerait pas
son ouverture, et le thème vit au niveau du module. L'animation est coupée ici
seulement, pour que la palette arrive avec la couleur et non une seconde plus
tard.
`,
	}),
}

export default meta

export const ThemeBuilderStory: StoryObj<typeof ThemeBuilder> = {
	name: "Theme builder",
	parameters: renderOnly,
	render: () => <ThemeBuilder />,
}
