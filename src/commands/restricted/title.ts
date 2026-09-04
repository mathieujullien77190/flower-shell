import { BaseCommand } from "@types"
import { highlightFlower } from "../highlight"

/**
 * The logo of the shell, in ascii. The lone letters (R, I, B, G…) are color
 * markers read by highlightFlower, not text.
 */
export const title = `
 ________   .---.       ,-----.    .--.      .--.    .-''-.  .-------.               .-'''-. .---.  .---.     .-''-.    .---.     .---.      
|        |  | I,_I|     .'  B.-,B  '.  |  |_     |  |  .'S_ _S   \\ |  J_ _J   \\             / Z_Z     \\|   |  |D_ _D|   .'T_ _T   \\   | H,_H|     | K,_K|      
|   .----'I,-./  )I    / B,-.|  \\ _B \\ | G_( )_G   |  | / S( \` )S   '| J( ' )J  |            Z(\`' )Z/\`--'|   |  D( ' )D  / T( \` )T   'H,-./  )H   K,-./  )K      
|  _|____ I\\  '_ '\`)I ;  B\\  '_ /  |B :|G(_ o _)G  |  |. S(_ o _)S  ||J(_ o _)J /           Z(_ o _)Z.   |   '-D(_{;}_)D. T(_ o _)T  |H\\  '_ '\`)H K\\  '_ '\`)K    
|R_( )_R   | I> (_)  )I |  B_\`,/ \\ _/B  || G(_,_)G \\ |  ||  S(_,_)S___|| J(_,_)J.' __          Z(_,_)Z. '. |      D(_,_)D |  T(_,_)T___| H> (_)  )H  K> (_)  )K    
R(_ o._)R__|I(  .  .-'I : B(  '\\_/ \\B   ;|  |/    \\|  |'  \\   .---.|  |\\ \\  |  |        .---.  \\  :| J_ _J--.   | '  \\   .---.H(  .  .-'H K(  .  .-'K    
|R(_,_)R     I\`-'\`-'I|___\\ B\`"/  \\  )B / |  '  /\\  \`  | \\  \`-'    /|  | \\ \`'   /        \\    \`-'  ||J( ' )J |   |  \\  \`-'    / H\`-'\`-'H|___K\`-'\`-'K|___  
|   |       |        \\'. B\\_/\`\`"B.'  |    /  \\    |  \\       / |  |  \\    /          \\       / J(_{;}_)J|   |   \\       /   |        \\|        \\ 
'---'       \`--------\`  '-----'    \`---'    \`---\`   \`'-..-'  ''-'   \`'-'            \`-...-'  'J(_,_)J '---'    \`'-..-'    \`--------\`\`--------\` 
`

export const titleCommand: BaseCommand = {
	restricted: true,
	action: () => title,
	help: { description: "common.restricted", patterns: [] },
	display: {
		hideCmd: true,
		style: { alignItems: "center" },
		stylePre: theme => ({ fontSize: theme.fonts.logo }),
		highlight: (text, theme) =>
			highlightFlower(text, { fontSize: theme.fonts.logo }, theme.colors),
	},
}
