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

		// nothing to unroll: the text is there in one go. The timer used to
		// run all the same, showing the whole text on every turn only to
		// report the end at the last one — twenty seconds for a logo already
		// read
		if (!animation) {
			// set in one go, with no timer: the cascading render is the only
			// one here, and that is what we want — the text is already whole
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

		// a window one closes unmounts the terminal mid-writing: without this
		// the timer would keep running for nothing
		return () => clearInterval(timer)

		/**
		 * `canRendered` alone, and that is on purpose: the unrolling starts
		 * once, when the command gets its turn, and runs to the end. Adding
		 * the text or the settings would restart the timer mid-writing —
		 * turning the animation off while it plays would rewrite the line
		 * from its first letter. They do not move anyway: they come from the
		 * command, frozen as it executed.
		 */
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canRendered])

	// once the animation is over the text on screen is already baseTxt:
	// reading it directly avoids an effect resyncing it
	return { txt: finish ? baseTxt : textTime, finish }
}
