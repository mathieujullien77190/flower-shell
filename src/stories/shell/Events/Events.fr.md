Tout ce que le shell rend, et rien d'autre : le panneau de droite est écrit
avec les seules quatre props d'évènement, une ligne par commande, une coche
sous chaque moment qu'elle a atteint.

**Ouvrez la console du navigateur.** Chaque évènement y part en entier, et
c'est là qu'on voit ce que le panneau ne peut pas montrer : chacun porte le
nom, les arguments, et `pattern` — la ligne entière telle qu'elle a été
envoyée.

`onCommandStart` part avant que quoi que ce soit ne joue, lu sur cette ligne
— il part donc aussi pour une commande qui n'existe pas, ce que les autres ne
font jamais. `onCommandDone` part une fois que l'action a rendu son texte et
que l'effet a joué : la commande est faite, mais rien n'est encore à l'écran.
`onCommandRendered` part quand le texte a fini de s'écrire, ce qui sur une
sortie longue arrive bien plus tard.

`onCommandError` part à la place de `onCommandDone` quand la commande n'a pas
joué, et dit pourquoi par `reason`. Trois lignes à essayer, une par raison :
`nope` donne `unknown`, `theme nope` donne `args` — la commande existe,
l'argument non — et `boom` lève exprès, ce qui donne `thrown` et porte
l'erreur elle-même.
