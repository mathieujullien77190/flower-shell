import { useEffect, useState } from "react"

type useDisplayByLetterProps = {
	baseTxt: string
	canRendered: boolean
	animation: boolean
	reverse?: boolean
	stepTime?: number
	stepSize?: number
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
			// pose d'un coup, sans minuteur : le rendu en cascade est ici le
			// seul, et c'est ce qu'on veut — le texte est deja complet
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setTextTime(baseTxt)
			setFinish(true)
			return
		}

		const j = stepSize ? stepSize : Math.floor(baseTxt.length / 100) + 1
		let i = 0

		const timer = setInterval(() => {
			setTextTime(
				!reverse ? baseTxt.substr(0, i + 1) : baseTxt.substr(-(i + 1))
			)

			if (i > baseTxt.length - 1) {
				clearInterval(timer)
				setFinish(true)
			}
			i = i + j
		}, stepTime)

		// une fenetre qu'on ferme demonte le terminal en pleine ecriture :
		// sans cela le minuteur continuerait de tourner dans le vide
		return () => clearInterval(timer)

		/**
		 * `canRendered` seul, et c'est voulu : le deroule part une fois,
		 * quand la commande passe son tour, et va jusqu'au bout. Ajouter le
		 * texte ou les reglages relancerait le minuteur en pleine ecriture —
		 * couper l'animation pendant qu'elle joue reecrirait la ligne depuis
		 * la premiere lettre. Ils ne bougent pas de toute facon : ils
		 * viennent de la commande, figee des son execution.
		 */
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canRendered])

	// une fois l'animation terminee le texte affiche vaut deja baseTxt : le lire
	// directement evite un effet de resynchro
	return { txt: finish ? baseTxt : textTime, finish }
}
