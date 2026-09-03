`<Shell />`, sans rien du tout. Toutes les props sont facultatives, et ce
qu'on ne donne pas n'existe simplement pas. La table ci-dessous les liste
toutes — elle n'est que sur cette page, puisqu'elle dirait la même chose sur
toutes les autres.

Pas de `commands`, donc le registre est vide : rien ne répond, et rien ne
proteste non plus — une ligne tapée passe à la suivante. Et pas de thème, donc
rien n'est peint : le shell prend les couleurs et la police de la page qui le
tient, l'invite retombe sur `>`, et le balisage cesse de colorer. Donnez
`theme`, ou un catalogue `themes` dont il prendra le premier, et il
s'habille.
