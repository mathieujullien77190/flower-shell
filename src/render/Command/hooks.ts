import { useEffect, useState } from "react"

type useDisplayByLetterProps = {
	baseTxt: string
	canRendered: boolean
	animation: boolean
	reverse: boolean
	stepTime: number
	stepSize: number
}

export const useDisplayByLetter = ({
	baseTxt,
	canRendered,
	animation,
	reverse,
	stepTime = 10,
	stepSize,
}: useDisplayByLetterProps) => {
	const [textTime, setTextTime] = useState<string>("")
	const [finish, setFinish] = useState<boolean>(false)
	useEffect(() => {
		if (!canRendered) return

		// rien a derouler : le texte est la du premier coup. Le minuteur
		// tournait quand meme, affichant le texte entier a chaque tour pour
		// n'annoncer la fin qu'au bout — vingt secondes pour un logo deja lu
		if (!animation) {
			setTextTime(baseTxt)
			setFinish(true)
			return
		}

		const j = stepSize ? stepSize : Math.floor(baseTxt.length / 100) + 1
		let i = 0

		const timer = setInterval(() => {
			setTextTime(!reverse ? baseTxt.substr(0, i + 1) : baseTxt.substr(-(i + 1)))

			if (i > baseTxt.length - 1) {
				clearInterval(timer)
				setFinish(true)
			}
			i = i + j
		}, stepTime)

		// une fenetre qu'on ferme demonte le terminal en pleine ecriture :
		// sans cela le minuteur continuerait de tourner dans le vide
		return () => clearInterval(timer)
	}, [canRendered])

	// une fois l'animation terminee le texte affiche vaut deja baseTxt : le lire
	// directement evite un effet de resynchro
	return { txt: finish ? baseTxt : textTime, finish }
}
