import styled from "styled-components"
import { colors, fonts } from "@theme"

export const TerminalContainer = styled.div`
	background: ${() => colors().background};
	color: ${() => colors().textColor};
	font-family: ${() => fonts().shell};
	width: 100%;

	/* le theme pose une marge interieure : elle se prend sur les 100% de
	   large et de haut, sinon le conteneur deborde de ce qui le contient */
	box-sizing: border-box;

	/* min-height et non height : le fond doit descendre avec la sortie.
	   A hauteur fixe, tout ce qui depasse le parent se dessine hors du
	   fond, sur le blanc de la page. */
	min-height: 100%;

	/* taille du shell, heritee par les commandes et la saisie */
	font-size: 16px;

	/* referentiel des unites cqw : l'art ascii se dimensionne sur la
	   fenetre de l'OS et non sur celle du navigateur */
	container-type: inline-size;

	/* Sous 700px de large, la police suit la fenetre au lieu de laisser les
	   lignes se replier : 700 / 16 = 43.75, donc 100cqw / 43.75 vaut 16px
	   pile a 700px et decroit en dessous. Pas de palier, pas de saut.
	
	   La regle vise les enfants : cqw se mesure sur le conteneur le plus
	   proche, et un element ne peut pas se mesurer sur lui-meme. */
	& > * {
		font-size: clamp(7px, calc(100cqw / 43.75), 16px);
	}
`
