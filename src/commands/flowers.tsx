import { CSSProperties, ReactNode } from "react"
import reactStringReplace from "react-string-replace"
import uniqid from "uniqid"

import { colors } from "@theme"

export const highlightFlower = (text: string, baseStyles: CSSProperties) => {
	let result: string | ReactNode[] = text

	const list = [
		{ reg: /R(.*)R/g, styles: { color: colors().restrictedColor } },
		{ reg: /S(.*)S/g, styles: { color: colors().restrictedColor } },
		{ reg: /I(.*)I/g, styles: { color: colors().importantColor } },
		{ reg: /B(.*)B/g, styles: { color: colors().infoColor } },
		{ reg: /G(.*)G/g, styles: { color: colors().appColor } },
		{ reg: /T(.*)T/g, styles: { color: colors().restrictedColor } },
		{ reg: /J(.*)J/g, styles: { color: colors().importantColor } },
		{ reg: /H(.*)H/g, styles: { color: colors().appColor } },
		{ reg: /K(.*)K/g, styles: { color: colors().restrictedColor } },
		{ reg: /X(.*)X/g, styles: { color: colors().restrictedColor } },
		{ reg: /D(.*)D/g, styles: { color: colors().appColor } },
		{ reg: /Z(.*)Z/g, styles: { color: colors().infoColor } },
	]

	list.forEach(item => {
		result = reactStringReplace(result, item.reg, match => (
			<span
				key={uniqid()}
				style={{
					...item.styles,
					...baseStyles,
				}}
			>
				{match}
			</span>
		))
	})

	return result
}

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
					!flowersArr[j][i].match(/[@\(_vw\)]/gi)
						? `${flowersArr[j][i]}`
						: `${colorFlowers[j]}${flowersArr[j][i]}${colorFlowers[j]}`
				)
				.join("")
		)
		.join("\n")

	return compileFlowers
}

