Un terminal, et un panneau qui le pilote de l'extérieur. Le panneau n'est pas
dans le shell et ne sait rien de lui : il est sous le même
`<ShellProvider>`, prend `useShell()`, et nomme le terminal qu'il vise.

`run` envoie une ligne comme si elle avait été tapée — essayez `nope`, que
le shell refuse comme n'importe quelle mauvaise ligne. `runRestricted` envoie
ce que le visiteur ne peut pas : `title` et `welcome` sont l'ouverture,
rejouables à volonté. Et `actions(id)` est l'état lui-même, setters compris —
`clear`, `reset`, `setLang`, `setAnimation`.

**Le panneau ne suit pas le terminal.** `actions(id)` relit au moment de
l'appel, mais rien ici ne s'abonne à quoi que ce soit : l'affichage montre ce
qu'était l'état quand vous avez appuyé sur _read_, pas ce qu'il est. Tapez une
ligne dans le terminal et rappuyez sur _read_ pour le voir bouger. Un panneau
qui devrait rester à jour garderait sa propre copie, ou vivrait dans le shell
plutôt qu'à côté.
