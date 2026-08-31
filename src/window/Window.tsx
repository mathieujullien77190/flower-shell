import { useEffect, useRef, useState, Ref, forwardRef } from "react"
import { WindowProps, Pos, Mode } from "./types"
import * as S from "./UI"
import { TOP_LAYER } from "./constants"
import { clampDrag } from "./helpers"

const NO_DRAG: Pos = { x: 0, y: 0 }

const BaseWindow = (
	{
		show,
		container,
		children,
		title = "Sans titre",
		tutorial,
		mark,
		layer = TOP_LAYER,
		rank = 0,
		bottomInset = "0px",
		compact = false,
		move = true,
		start = "center-center",
		margin = "0px",
		canExpand = true,
		canClose = true,
		onFocus = () => {},
		onClose = () => {},
	}: WindowProps,
	ref: Ref<HTMLDivElement>
) => {
	const [userMode, setUserMode] = useState<Mode>("medium")

	// en mode compact la fenetre reste pleine et non redimensionnable
	const mode: Mode = compact ? "full" : userMode

	// pleine, elle n'a plus rien a agrandir : `compact` l'emporte sur le choix
	const expandable = canExpand && !compact

	/**
	 * Deplacement applique a la souris, en pixels, par-dessus une position
	 * de base en pourcentage. Mesurer le bureau pour poser la fenetre
	 * demandait un effet et un setState au montage ; le pourcentage donne
	 * le meme placement, suit le redimensionnement, et se passe des deux.
	 */
	const [drag, setDrag] = useState<Pos>(NO_DRAG)
	const [followMouse, setFollowMouse] = useState<boolean>(false)

	const boxRef = useRef<HTMLDivElement>(null)

	const handleResize = () => {
		// changer de taille remet la fenetre a sa place : le deplacement
		// d'avant n'a plus de sens dans le nouveau gabarit
		setDrag(NO_DRAG)
		setUserMode(prev => (prev === "full" ? "medium" : "full"))
	}

	/**
	 * La croix previent, et rien de plus : c'est `show` qui fait disparaitre
	 * la fenetre, et il vient de l'exterieur. Elle se remet droite au
	 * passage — deplacee, agrandie, elle rouvrirait telle qu'on l'a laissee.
	 */
	const handleClose = () => {
		setDrag(NO_DRAG)
		setUserMode("medium")
		onClose()
	}

	useEffect(() => {
		if (!followMouse) return

		const handlerMousemove = (event: MouseEvent) => {
			setDrag(prev => ({
				x: prev.x + event.movementX,
				y: prev.y + event.movementY,
			}))
		}

		/**
		 * Le relachement tombe rarement sur la barre de titre, souvent
		 * hors de la page : sans ecoute au niveau du document, la fenetre
		 * resterait collee au curseur. Le blur couvre la souris relachee
		 * en dehors de l'onglet, qui n'emet aucun mouseup.
		 */
		const handlerMouseup = () => {
			setFollowMouse(false)

			const area = container.current?.getBoundingClientRect()
			const box = boxRef.current?.getBoundingClientRect()
			if (area && box) setDrag(prev => clampDrag(prev, box, area))
		}

		document.addEventListener("mousemove", handlerMousemove)
		document.addEventListener("mouseup", handlerMouseup)
		window.addEventListener("blur", handlerMouseup)

		return () => {
			document.removeEventListener("mousemove", handlerMousemove)
			document.removeEventListener("mouseup", handlerMouseup)
			window.removeEventListener("blur", handlerMouseup)
		}
	}, [followMouse, container])

	return (
		<>
			{show && (
				<S.Container
					data-window={mark}
					ref={boxRef}
					$mode={mode}
					$rank={rank}
					$drag={drag}
					$followMouse={followMouse}
					$layer={layer}
					$bottomInset={bottomInset}
					$start={start}
					$margin={margin}
					onMouseDown={onFocus}
				>
					<S.topBar
						data-tutorial={tutorial}
						$move={move}
						onDoubleClick={expandable ? handleResize : undefined}
						onMouseDown={() => {
							if (move && mode !== "full") setFollowMouse(true)
						}}
					>
						<S.Title>{title}</S.Title>
						<S.Actions>
							{expandable && (
								<span onClick={handleResize}>
									{mode === "full" ? "-" : "+"}
								</span>
							)}
							{canClose && <span onClick={handleClose}>x</span>}
						</S.Actions>
					</S.topBar>
					<S.Content ref={ref}>
						<S.Wrapper>{children}</S.Wrapper>
					</S.Content>
				</S.Container>
			)}
		</>
	)
}

export const Window = forwardRef<HTMLDivElement, WindowProps>(BaseWindow)
