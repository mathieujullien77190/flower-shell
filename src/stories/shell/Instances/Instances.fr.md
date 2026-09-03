Deux shells sur la même page, et rien de commun entre eux : deux historiques,
deux curseurs, deux langues. Tapez dans l'un, l'autre ne bouge pas ; celui de
gauche répond en anglais, celui de droite en français, depuis le même
`dict`.

**Pas d'id, pas de pilotage.** Un terminal ne s'atteint que s'il a été nommé,
c'est à quoi sert `id`, et `<ShellProvider>` est l'endroit où ces noms se
retrouvent. La barre du haut prend `useShell()` et vise :
`run("left", "hello")`, `runRestricted("left", "title")`,
`actions("right")` pour l'état de celui-là. Un shell sans `id`, ou sans
provider au-dessus, ne peut pas être atteint — et n'a pas à l'être.

**Le thème est l'exception.** Il vit dans un module, parce que le balisage est
coloré par une fonction et non par un composant, et qu'un contexte ne
l'atteindrait pas : `theme lavender` tapé dans un terminal repeint les deux. La
langue, l'historique et les options sont par shell ; la palette non.
