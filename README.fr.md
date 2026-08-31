Langue : [English](./README.md)

Documentation en ligne : [Storybook](https://mathieujullien77190.github.io/flower-shell/)

# flower-shell

Un terminal rétro en React : moteur de commandes, historique, autocomplétion
et rendu ASCII animé. Aucune mise en page imposée.

```tsx
import { Shell, baseCommands, themes } from "flower-shell"

const App = () => <Shell commands={baseCommands} themes={themes} />
```

## Le composant

| prop                | rôle                                                                                                                             |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `commands`          | les commandes connues, indexées par leur nom : celles du paquet, plus les vôtres ; facultative                                   |
| `initialCommands`   | commandes jouées au démarrage, une seule fois ; c'est là que se met l'ouverture                                                  |
| `theme`             | le nom du thème de départ, une clé de `themes` ; sans elle, le premier d'entre eux — et sans `themes` non plus, rien n'est peint |
| `themes`            | les thèmes que le visiteur peut prendre, un par nom ; `themes={themes}` pour tout le catalogue                                   |
| `dict`              | les langues du shell, un dictionnaire par langue ; sans elle, l'anglais seul                                                     |
| `lang`              | langue de départ, parmi celles de `dict` (`en` par défaut)                                                                       |
| `animation`         | écriture lettre par lettre des réponses (`true` par défaut)                                                                      |
| `keyboardOnFocus`   | la saisie reprend le focus dès qu'elle le perd (`true` par défaut)                                                               |
| `scrollRef`         | élément à faire défiler quand la sortie s'allonge : la boîte qui tient le shell                                                  |
| `id`                | le nom sous lequel un `<ShellProvider>` le trouve, pour que `useShell()` le commande                                             |
| `onCommandStart`    | avant que la commande ne joue ; part aussi pour une commande inconnue                                                            |
| `onCommandDone`     | l'action a rendu son texte et l'effet a joué ; rien n'est encore à l'écran                                                       |
| `onCommandRendered` | le texte a fini de s'écrire                                                                                                      |
| `onCommandError`    | la commande n'a pas joué ; `reason` dit pourquoi                                                                                 |

Toutes les props sont facultatives, et ce qu'on ne donne pas n'existe
simplement pas. `<Shell />` se monte sur rien : registre vide, donc une ligne
tapée passe à la suivante sans message d'erreur, et aucun thème, donc rien
n'est peint — le shell prend les couleurs et la police de la page qui le
tient, l'invite retombe sur `>`, et le balisage cesse de colorer. Dès qu'une
commande existe, une commande inconnue redevient une erreur.

## Les commandes de base

`help`, `clear`, `hello`, `flowers`, `animation`, `lang` et `theme`.

`test` s'exporte tout seul, à côté de `baseCommands`, et se monte à la main :
c'est un banc d'essai, pas quelque chose que vos visiteurs ont à trouver.

```tsx
import { Shell, baseCommands, test } from "flower-shell"

;<Shell commands={{ ...baseCommands, test }} />
```

Il affiche toutes les couleurs du thème, la source à gauche et son rendu à
droite — de quoi juger une palette, ou retrouver la syntaxe du balisage sans
ouvrir cette page — et il finit sur un marqueur cliquable qui joue vraiment
`hello` quand on clique dessus.

Plus les commandes restreintes — que le visiteur ne peut pas taper :

- `title` affiche le logo ASCII du shell et `welcome` le texte de la clé
  `welcome.text`. Ce sont des commandes comme les autres — leur texte vit dans
  le dictionnaire, et vous y mettez vos mots en recouvrant cette clé par
  `dict`. Vous les jouez en les mettant dans `initialCommands`. Sans ça le
  shell démarre nu, et vous posez votre marque
- `unknow` et `argumenterror` sont cherchées **par nom** par le moteur, qui
  rend leur texte quand une commande est inconnue ou mal appelée. Les retirer
  est permis : le dictionnaire du paquet prend le relais, et `commands={{}}` reste un
  shell valide, qui ne répond simplement à rien
- `actionmap` est l'aiguillage des marqueurs cliquables : un clic sur
  `#libellé ~ cmd args#` lui envoie `cmd args`, et son effet joue cette ligne.
  Elle n'affiche rien d'elle-même — retirez-la et le clic ne fait plus rien

## L'ouverture

Le shell démarre nu. Le logo et le mot d'accueil sont deux commandes, jouées
comme les autres :

```tsx
<Shell commands={baseCommands} initialCommands={["title", "welcome"]} />
```

`welcome` affiche la clé `welcome.text`, que le paquet porte déjà. Pour y
mettre vos mots, recouvrez cette clé comme n'importe quelle autre :

```tsx
<Shell
	commands={baseCommands}
	initialCommands={["title", "welcome"]}
	dict={{
		en: { welcome: { text: "Welcome to $acme$ — type `help` to look around" } },
	}}
/>
```

`initialCommands` ne joue qu'une fois, sur un écran vierge : un `clear` ne les
rejoue pas. `clear` efface l'écran et rien d'autre — faire revenir quelque
chose après lui est à vous de l'écrire, depuis `onCommandDone` et un shell
nommé, atteint par `useShell()`.

## Suivre les commandes

Quatre props, quatre moments. Chacune reçoit un objet, de la même forme d'un
bout à l'autre :

```tsx
<Shell
	commands={baseCommands}
	onCommandStart={event => console.log("about to run", event.pattern)}
	onCommandDone={event => console.log("ran", event.name, event.args)}
	onCommandRendered={event => console.log("written out", event.name)}
	onCommandError={event => console.error(event.reason, event.pattern)}
/>
```

| champ     |                                               |
| --------- | --------------------------------------------- |
| `name`    | le premier mot de la ligne                    |
| `args`    | le reste, mot à mot                           |
| `pattern` | la ligne entière, telle qu'elle a été envoyée |

`onCommandStart` part avant que quoi que ce soit ne joue, lu sur cette ligne.
À ce moment le shell ne sait pas encore s'il connaît une commande de ce nom,
donc celle-ci **part aussi pour une ligne qu'il refusera** — c'est ce qui en
fait l'endroit où voir tout ce qui est tapé.

`onCommandDone` part une fois que l'action a rendu son texte et que l'effet a
joué. La commande est faite ; rien n'est encore à l'écran.

`onCommandRendered` part quand le texte a fini de s'écrire. Sur une sortie
longue, c'est bien après `onCommandDone` — l'animation l'écrit lettre par
lettre. Il part une fois par commande, au passage.

`onCommandError` part **à la place de** `onCommandDone` quand la commande n'a
pas joué, et ajoute `reason` à l'objet :

| `reason`  |                                                                     |
| --------- | ------------------------------------------------------------------- |
| `unknown` | aucune commande de ce nom dans le registre                          |
| `args`    | la commande existe, ses arguments ne passent pas                    |
| `thrown`  | son action ou son effet a levé ; ce qui a été levé est dans `error` |

Un shell au registre vide n'a rien à redire — il laisse passer ce qu'on lui
tape, exprès — et ne signale donc aucune erreur.

## Écrire une commande

```tsx
const ping: BaseCommand = {
	restricted: false,
	action: () => t("ping.pong"),
	effect: () => console.log("joué"),
	help: {
		patterns: [{ pattern: "ping", description: "ping.usage" }],
	},
}

const commands: BaseCommands = { ...baseCommands, ping }
```

Le nom qui invoque la commande est sa clé dans l'objet : le champ `name` n'existe
pas.

Un texte est **toujours une `string`**. Dans une `action`, c'est à vous
d'appeler `t("clé")` — vous pouvez donc mélanger : `` `${t("ping.pong")} ${nom}` ``.
Dans les champs statiques (`help.description`, `description` d'un pattern),
vous écrivez **la clé** et le shell la traduit au moment de s'en servir. Une
clé absente du dictionnaire s'affiche telle quelle, ce qui permet d'écrire
directement `description: "répond pong"` quand une seule langue suffit.

| champ        | rôle                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| `action`     | le texte affiché, déjà traduit                                               |
| `effect`     | l'effet de bord ; la commande attaque votre état elle-même                   |
| `JSX`        | rendu React sous la sortie, pour une commande qui affiche mieux qu'un texte  |
| `help`       | l'aide ; une fonction si elle dépend de l'état, comme celle de `lang`        |
| `testArgs`   | arguments acceptés (`authorize`, `empty`) ; `authorize` accepte une fonction |
| `display`    | animation, styles, coloration personnalisée                                  |
| `restricted` | vraie si le visiteur ne peut pas la taper ; réservée au code                 |

## Le balisage du texte

Les réponses passent par une passe de coloration. Chaque couleur du thème a
son marqueur :

| marqueur               | effet                                                         |
| ---------------------- | ------------------------------------------------------------- |
| `§texte§`              | couleur d'accent                                              |
| `+texte+`              | couleur d'information                                         |
| `` `texte` ``          | couleur des commandes                                         |
| `!texte!`              | couleur du restreint                                          |
| `$texte$`              | couleur de marque                                             |
| `_texte_`              | la couleur du fond : invisible jusqu'à la sélection           |
| `#libellé ~ cmd args#` | cliquable et souligné : le clic joue `cmd` avec ses arguments |

Un marqueur entre crochets — `[+texte+]` — devient un tag : un fond plein au
lieu d'une couleur de texte, le libellé en noir ou en blanc selon la clarté du
fond.

Un antislash devant un marqueur l'affiche tel quel : `\+` donne `+`. Un
antislash sans marqueur derrière reste tel quel, il n'y a donc pas besoin de
l'échapper.

## Les langues

Le paquet livre ses textes en deux dictionnaires — `dictEn` et `dictFr`, un
fichier chacun — mais n'en monte **qu'un seul par défaut : l'anglais**. Les
langues du shell sont exactement les clés de la prop `dict` :

```tsx
import { Shell, baseCommands, dictEn, dictFr } from "flower-shell"

<Shell commands={baseCommands} />                                            // en
<Shell commands={baseCommands} lang="fr" dict={{ en: dictEn, fr: dictFr }} />
```

`lang` choisit celle du départ ; la commande `lang` n'accepte que celles qui
sont montées, et son aide les liste — chacune se décrit par la clé
`lang.<code>`, à fournir dans votre dictionnaire pour votre langue.

Pour une autre langue, vous écrivez le dictionnaire, sur le modèle de ceux du
paquet. Chaque langue montée est posée **sur l'anglais** : une clé que votre
dictionnaire ne couvre pas sort en anglais plutôt qu'en clé nue, et vous pouvez
n'ajouter qu'un texte sans perdre les autres.

```tsx
<Shell
	commands={commands}
	lang="de"
	dict={{
		en: { welcome: { text: "Type `help`" } }, // l'anglais du paquet, une clé recouverte
		de: dictDe, // le vôtre, écrit chez vous
	}}
/>
```

`t("hello.world")` lit la langue courante, retombe sur l'anglais, puis sur la
clé elle-même. `t("lang.set", { lang: "fr" })` remplace les `{nom}` du texte.

**La traduction a lieu quand la commande s'exécute**, et le résultat est stocké
tel quel. Après un `lang en`, les lignes déjà affichées restent donc dans leur
langue d'origine ; seules les suivantes changent.

## Le thème

Le paquet en livre huit, à la manière d'un éditeur :

| nom         |                                                         |
| ----------- | ------------------------------------------------------- |
| `flower`    | **le défaut** — feuillage sombre, une fleur pour invite |
| `twilight`  | un terminal sombre et neutre, invite `>`                |
| `parchment` | un terminal clair et neutre                             |
| `dracula`   | fond ardoise violette, accents saturés                  |
| `nord`      | fond bleu nuit, accents froids                          |
| `gruvbox`   | fond terreux, accents chauds                            |
| `monokai`   | fond olive sombre, accents francs                       |
| `solarized` | fond ivoire, accents mesurés                            |

Chacun s'exporte sous son nom — `flowerTheme`, `twilightTheme`, `nordTheme`… —
et `themes` rassemble les huit sous les clés du tableau.

Deux props, et elles se lisent comme `dict` et `lang`. `themes` dit quels
thèmes existent ; `theme` nomme celui du départ, une clé de `themes` :

```tsx
import { Shell, baseCommands, nordTheme, themes } from "flower-shell"

// the whole catalogue: all eight, worn on the first of them
<Shell commands={baseCommands} themes={themes} />

// one of them, and nothing else to switch to
<Shell commands={baseCommands} themes={{ nord: nordTheme }} />

// the catalogue to reach, and the name it starts on
<Shell commands={baseCommands} themes={themes} theme="nord" />

// neither: nothing to switch to, and nothing painted
<Shell commands={baseCommands} />
```

**Les thèmes du shell sont exactement les clés de `themes`** — rien de plus.
`theme <nom>` n'accepte que ceux-là, et `help theme` les liste, chacun décrit
par la clé de dictionnaire `theme.<nom>`.

Aucune des deux n'est obligatoire, et aucune ne retombe sur un défaut qui
habillerait le shell dans votre dos. `theme` nomme ce qu'il porte ; sans elle,
la première entrée de `themes` ; sans celle-ci non plus, `bareTheme` — fond
transparent, couleurs et police héritées, `>` pour invite, et un balisage qui
ne colore plus rien. Ce qu'on ne vous demande pas n'est pas peint.

Un nom absent du catalogue est ignoré plutôt que monté en douce : partir sur
un thème que le visiteur ne pourrait jamais retrouver, ni `theme <nom>` ni
`help theme` ne sauraient l'expliquer.

Donc un shell à vous, avec un thème du paquet, un des vôtres, et aucune sortie
hors des deux :

```tsx
<Shell
	commands={baseCommands}
	themes={{ nord: nordTheme, mine }}
	theme="mine"
	dict={{ en: { theme: { mine: "The house theme" } } }}
/>
```

Un thème s'écrit par morceaux, et se monte sous le nom que le visiteur
tapera :

```tsx
const mine = {
	colors: { background: "#212E35", importantColor: "#FFCC6A" },
	prompt: "🌼",
	fonts: { shell: "monospace" },
	container: { padding: "16px" },
}

<Shell commands={commands} themes={{ mine }} theme="mine" />
```

Les valeurs absentes gardent celles de `defaultTheme`, y compris à
l'intérieur d'un groupe : ne donner que `colors.background` laisse les autres
couleurs en place. Un thème monté est posé sur `defaultTheme` et non sur celui
qu'il remplace : y passer donne le même résultat quel que soit le thème qu'on
quitte.

`container` est le style du conteneur général du terminal, un
`CSSProperties` complet posé en inline sur lui : la marge intérieure est le
besoin courant — elle vaut `16px` par défaut — mais un arrondi, une bordure ou
une ombre se posent au même endroit. Ce qu'on y met recouvre le style de base
du conteneur, propriété par propriété.

Les huit thèmes du paquet stylent chacun le leur : une bordure prise dans les
couleurs de la palette, un arrondi qui va avec, et la place que le thème
demande — `monokai` a les coins carrés, `parchment` élargit ses marges. Comme
un thème monté est posé sur `defaultTheme`, un thème à vous qui ne dit rien de
`container` hérite de celui de `flower` ; donnez-lui son propre `container`
pour dire autre chose.

`fonts.shell` habille la sortie comme la saisie, et vaut `monospace` par
défaut : un terminal veut du chasse fixe.

## Plusieurs terminaux, et comment en commander un

Chaque shell porte son historique, son curseur et ses options : plusieurs
peuvent donc vivre sur la même page sans jamais se croiser. Deux terminaux
côte à côte gardent deux historiques et peuvent répondre en deux langues,
depuis le même `dict`.

**Pas d'id, pas de pilotage.** Un terminal ne s'atteint que s'il a été nommé,
et `<ShellProvider>` est l'endroit où ces noms se retrouvent. Rien n'a à
deviner de quel shell on parle, puisqu'un shell qui ne dit rien n'est pas
adressable du tout.

```tsx
import { Shell, ShellProvider, useShell, baseCommands } from "flower-shell"

const Toolbar = () => {
	const shell = useShell()

	return (
		<>
			<button onClick={() => shell.run("left", "help")}>help, left</button>
			<button onClick={() => shell.run("right", "flowers")}>
				flowers, right
			</button>
		</>
	)
}

;<ShellProvider>
	<Toolbar />
	<Shell id="left" commands={baseCommands} lang="en" />
	<Shell id="right" commands={baseCommands} lang="fr" />
</ShellProvider>
```

| `useShell()`                 | rôle                                              |
| ---------------------------- | ------------------------------------------------- |
| `run(id, pattern)`           | joue une ligne comme si le visiteur l'avait tapée |
| `runRestricted(id, pattern)` | joue une ligne que le visiteur ne peut pas taper  |
| `actions(id)`                | l'état de ce shell : historique, curseur, options |

`actions(id)` relit à chaque appel, et porte les setters dont les commandes se
servent — `setLang`, `setAnimation`, `reset`, et les autres.

L'id est lu quand la méthode est appelée, pas quand le hook s'exécute : une
barre de boutons placée avant les terminaux dans l'arbre se rend avant qu'ils
existent, et au moment où l'on clique ils sont là. Un id qui n'est pas monté
lève, en disant lesquels le sont.

Hors de React il n'y a pas de hook à appeler : prenez `useShell()` dans un
composant à vous et rangez les méthodes où il vous les faut.

**Ce qui reste partagé, et pourquoi.** Le thème et les dictionnaires restent
dans des modules, communs à tous les terminaux de la page : le balisage est
coloré par `highlight`, une fonction et non un composant, qu'un contexte
n'atteindrait pas. Donc `theme nord` tapé dans un shell repeint les autres,
tandis que la langue, l'historique et les options appartiennent à chacun.

Une commande atteint son propre shell sans avoir à le demander : dans une
`action` ou un `effect`, `t()` parle la langue du shell en train de jouer et
`shellActions()` rend son état. Cela tient le temps que la commande joue, qui
est synchrone — un `effect` qui attend quelque chose et touche l'état ensuite
est hors de cette fenêtre, et a besoin de `useShell()` et d'un id.

## Développer

```sh
npm run storybook   # le terminal seul, sans le reste du site
```

Les stories sont sous `src/stories`, une par cas : le shell nu, avec des
commandes personnalisées, deux pilotés par une même barre, dans chaque langue.
Chacune montre le code qui la produit, imports compris.

**Shell / Events** pose un panneau à côté du terminal et le remplit avec les
seules quatre props d'évènement : une ligne par commande, une coche sous
chaque moment qu'elle a atteint. Chaque évènement part aussi en entier dans
la console du navigateur — ouvrez-la, c'est là que sont les arguments et la
ligne complète. Tapez `title` et regardez l'écart entre les deux dernières
coches, c'est l'animation ; puis `nope`, `theme nope` et `boom`, un pour
chaque raison que porte une erreur.

**Shell / Theme builder** est un créateur de thème : on part d'un thème du
catalogue, on déplace les couleurs, l'aperçu suit, et le bloc du bas est la
prop `theme` correspondante — à copier telle quelle.

**Markup** documente le balisage, marqueur par marqueur : les couleurs, les
tags, l'échappement.

## Licence

MIT.
