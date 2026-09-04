Choisissez un thème de départ, déplacez les couleurs et la taille du logo, et
lisez le résultat deux fois : une fois en shell, une fois en code qui le
produit. Le bloc du bas est la paire à coller : le thème lui-même, et l'entrée
`themes` plus le nom `theme` qui le montent.

L'aperçu est le vrai : un `Shell` portant le brouillon, ouvrant sur `title`
— le logo pour lequel `fonts.logo` est écrit — puis sur `test`, la commande
qui affiche toutes les couleurs du thème.

`fonts.logo` est une longueur CSS et non un nombre de pixels : elle s'écrit
sur la largeur du conteneur, `calc(100cqw / 90)` par défaut, si bien que le
logo garde sa forme quel que soit ce dans quoi le terminal est servi. Diviser
par moins le fait plus gros.

Il remonte à chaque touche d'un picker : un shell déjà monté ne rejouerait pas
son ouverture, et le thème vit au niveau du module. L'animation est coupée ici
seulement, pour que la palette arrive avec la couleur et non une seconde plus
tard.
