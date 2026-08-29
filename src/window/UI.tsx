import styled from "styled-components"
import { Mode, Pos } from "./types"
import { colors, fonts, windowColors } from "@theme"
import {
	FULL,
	ANIM_TIME,
	CASCADE,
	MEDIUM_MARGIN,
	MEDIUM_SIZE,
	TOP_LAYER,
} from "./constants"

type ContainerProps = {
	$mode: Mode
	$rank: number
	$drag: Pos
	$followMouse: boolean
	$layer: number
	/**
	 * Hauteur reservee en bas du conteneur, en CSS. Le bureau y met sa
	 * barre des taches ; sans elle, la fenetre passerait dessous.
	 */
	$bottomInset: string
}

/**
 * Place de la fenetre, en pourcentage : aucune mesure du bureau n'est
 * necessaire, et elle suit son redimensionnement. La cascade et le
 * deplacement a la souris s'ajoutent en pixels.
 *
 * Elle sort en style inline, pas dans le CSS : styled-components fabrique
 * une classe par valeur interpolee, et un glisser en produirait une par
 * pixel parcouru — la console finissait par le signaler.
 *
 * Le deplacement passe par top/left et non par un transform : un ancetre
 * transforme devient le referentiel des position: fixed qu'il contient,
 * ce qui decalait le canvas plein ecran de stux.
 */
const place = ({ $mode, $rank, $drag }: ContainerProps) => {
	if ($mode === "full") return { top: 0, left: 0 }
	if ($mode === "close") return { top: "50%", left: "50%" }

	const shift = $rank * CASCADE

	return {
		top: `calc(${MEDIUM_MARGIN}% + ${shift + $drag.y}px)`,
		left: `calc(${MEDIUM_MARGIN}% + ${shift + $drag.x}px)`,
	}
}

export const Container = styled.div.attrs<ContainerProps>(props => ({
	style: place(props),
}))`
	position: absolute;

	${({ $mode, $bottomInset }) => {
		if ($mode === "close") return "width: 0; height: 0;"

		const side = $mode === "full" ? 100 : MEDIUM_SIZE
		return `
			width: calc(${side}% - ${FULL.borderSize} * 2);
			height: calc(${side}% - ${$bottomInset} - ${FULL.borderSize} * 2);
		`
	}}


	border-style: solid;
	border-width: ${FULL.borderSize};
	border-color: ${() => windowColors().border};
	font-family: ${() => fonts().window};
	background-color: ${() => windowColors().content};
	color: ${() => windowColors().text};
	overflow: hidden;
	font-weight: ${FULL.fontWeight};
	z-index: ${({ $layer }) => $layer || TOP_LAYER};

	/* pendant le glisser, la transition lacherait le curseur : seules la
	   largeur et la hauteur restent animees */
	transition: ${({ $followMouse }) =>
		$followMouse
			? `width ${ANIM_TIME / 1000}s ease-out, height ${
					ANIM_TIME / 1000
				}s ease-out`
			: `all ${ANIM_TIME / 1000}s ease-out`};

	${({ $mode }) => {
		if ($mode === "medium")
			return `
				box-shadow: 3px 2px 4px #00000041;
				border-radius: 4px;
			`
	}}
`

export const topBar = styled.div`
	height: 15px;
	background-color: ${() => windowColors().titleBar};
	border-bottom-style: solid;
	border-bottom-width: ${FULL.borderSize};
	border-bottom-color: ${() => windowColors().border};
	display: flex;
	align-items: center;
	padding: ${FULL.padding};
	cursor: move;
`

export const Content = styled.div`
	overflow-y: auto;
	height: ${`calc(100% - ${FULL.padding} * 2 - 25px)`};
	padding: ${FULL.padding};
	background-color: ${() => colors().background};

	&::-webkit-scrollbar {
		-webkit-appearance: none;
		width: 12px;
		background-color: #f2e7c8;
		border-radius: 2px;
	}

	&::-webkit-scrollbar-thumb {
		background-color: #776b6d;
		border-radius: 2px;
		border-top: solid 1px black;
		border-bottom: solid 1px black;
	}
`

export const Title = styled.div`
	width: 100%;
	font-weight: bold;
	display: flex;
	justify-content: start;
	align-items: center;
`

export const Actions = styled.div`
	margin: 0 auto;
	display: flex;
	justify-content: center;
	align-items: center;
	span {
		cursor: pointer;
		font-size: 14px;
		margin-top: -1px;
		font-weight: bold;
		padding: 0 6px;
	}
`

export const Wrapper = styled.div<{ $ready: boolean; $mode: Mode }>`
	width: 100%;
	height: 100%;
	opacity: ${({ $ready }) => ($ready ? 1 : 0)};

	${({ $mode }) =>
		$mode !== "close" &&
		`
    transition: all ${ANIM_TIME / 1000}s ease-out;
  `};
`
