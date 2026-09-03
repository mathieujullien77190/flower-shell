**Les langues du shell sont exactement les clés de `dict`** — rien de plus.
`lang` choisit celle du départ, parmi celles-là. Les deux stories ci-dessous
ouvrent sur `help lang`, qui liste ce que chacune monte, et rien d'autre.

**Le français** est le cas facile : le paquet livre `dictFr`, il n'y a qu'à
le monter à côté de `dictEn`, et `lang fr` comme `lang en` répondent.

**L'allemand** est l'autre cas, et le modèle pour toute langue que le paquet
ne connaît pas. Rien ne vit dessous, donc `dictDe` doit couvrir les commandes
de base lui-même. Et `lang.de` est ajoutée au dictionnaire anglais, sans quoi
l'aide afficherait cette clé nue une fois le visiteur revenu à l'anglais.
