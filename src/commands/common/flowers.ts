import { BaseCommand } from "@types"
import { highlightFlower } from "../highlight"

/** the size of the ASCII flowers: written on the width of the container */
const FLOWER_FONT_SIZE = "calc(100cqw/60)"

const rand = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1) + min)

const heightFlower = 9
const flowers = [
	`       
       
 @@@@  
@@()@@ 
 @@@@  
  /    
\\ |    
\\\\|//  
^^^^^^^
`,
	`       
       
       
wWWWw  
(___)  
  Y    
\\ |/   
\\\\|/// 
^^^^^^^
`,
	`   _      
 _(_)_    
(_)@(_)   
  (_)\\    
     \`|/  
     \\|   
      | / 
   \\\\\\|// 
^^^^^^^^^^
`,
	`         
         
 vVVVv   
 (___)   
   Y     
  \\|/    
 \\ | /   
\\\\\\|///  
^^^^^^^^^
`,
	`           
   __/)    
.-(__(=:   
   | \\)    
 /||       
 \\||       
  \\|       
   |       
^^^^^^^^^^^
`,
]

export const plantFlowers = () => {
	const colorFlowers = ["R", "I", "B", "T", "J", "H", "X", "D", "Z"]
		.map(value => ({ value, sort: Math.random() }))
		.sort((a, b) => a.sort - b.sort)
		.map(({ value }) => value)

	const baseArr = Array(colorFlowers.length).fill(null)
	const allFlowers = Array(heightFlower).fill(null)
	const flowersArr = baseArr
		.map(() => flowers[rand(0, flowers.length - 1)])
		.map(flower => flower.split("\n"))

	const compileFlowers = allFlowers
		.map((_, i) =>
			baseArr
				.map((_, j) =>
					!flowersArr[j][i].match(/[@(_vw)]/gi)
						? `${flowersArr[j][i]}`
						: `${colorFlowers[j]}${flowersArr[j][i]}${colorFlowers[j]}`
				)
				.join("")
		)
		.join("\n")

	return compileFlowers
}

export const flowersCommand: BaseCommand = {
	restricted: false,
	action: () => plantFlowers(),
	display: {
		stylePre: theme => ({
			fontSize: FLOWER_FONT_SIZE,
			color: theme.colors.appColor,
			transform: "scaleX(-1)",
			textAlign: "right",
		}),
		highlight: (text, theme) =>
			highlightFlower(text, { fontSize: FLOWER_FONT_SIZE }, theme.colors),
		reverse: true,
		stepTime: 1,
		stepSize: 1,
	},
	help: {
		patterns: [{ pattern: "flowers", description: "flowers.usage" }],
	},
}
