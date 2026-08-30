[English](./README.md) · **Français**

# flower-shell

Un terminal rétro en React : moteur de commandes, historique, autocomplétion,
rendu ASCII animé, et une fenêtre pour le poser. Aucune mise en page imposée.

```tsx
import { Shell, baseCommands } from "flower-shell"

const App = () => <Shell commands={baseCommands} />
```

## Le composant

| prop | rôle |
| --- | --- |
| `commands` | les commandes connues, indexées par leur nom : celles du paquet, plus les vôtres ; facultative |
| `welcome` | le texte du mot d'accueil ; une clé du dictionnaire ou le texte lui-même |
| `initialCommands` | commandes jouées au démarrage, une seule fois ; c'est là que se met l'ouverture |
| `banner` | commandes rejouées au démarrage **et après chaque `clear`** |
| `theme` | couleurs, invite, polices |
| `dict` | les langues du shell, un dictionnaire par langue ; sans elle, l'anglais seul |
| `lang` | langue de départ, parmi celles de `dict` (`en` par défaut) |
| `scrollRef` | élément à faire défiler quand la sortie s'allonge |
| `onCommand` | appelé à chaque commande jouée, y compris celles du paquet |

Toutes les props sont facultatives : `<Shell />` se monte nu. Le registre
vide, il affiche l'invite et ne répond à rien — une ligne tapée passe à la
suivante, sans message d'erreur. Dès qu'une commande existe, une commande
inconnue redevient une erreur.

## Les commandes de base

`help`, `clear`, `hello`, `flowers`, `animation`, `lang`, `theme` et `test`.

`test` affiche toutes les couleurs du thème, la source à gauche et son rendu à
droite : de quoi juger une palette, ou retrouver la syntaxe du balisage sans
ouvrir cette page.

Plus trois commandes restreintes — que le visiteur ne peut pas taper :

- `title` affiche le logo ASCII du shell et `welcome` le mot d'accueil de la
  prop du même nom. Ce sont des commandes comme les autres : vous les jouez en
  les mettant dans `initialCommands`, ou dans `banner` pour qu'elles reviennent
  après un `clear`. Sans ça le shell démarre nu, et vous posez votre marque
- `unknow` et `argumenterror` sont cherchées **par nom** par le moteur, qui
  rend leur texte quand une commande est inconnue ou mal appelée. Les retirer
  est permis : le dictionnaire du paquet prend le relais, et `commands={{}}` reste un
  shell valide, qui ne répond simplement à rien

## L'ouverture

Le shell démarre nu. Le logo et le mot d'accueil sont deux commandes, jouées
comme les autres :

```tsx
<Shell
	commands={baseCommands}
	welcome="app.welcome"
	initialCommands={["title", "welcome"]}
	dict={{ en: { app: { welcome: "Type `help` to list the commands" } } }}
/>
```

`initialCommands` ne joue qu'une fois, sur un écran vierge : un `clear` ne les
rejoue pas. Ce qui doit revenir après un `clear` va dans `banner`, à la même
syntaxe près.

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
Dans les champs statiques (`help.description`, `description` d'un pattern, prop
`welcome`), vous écrivez **la clé** et le shell la traduit au moment de s'en
servir. Une clé absente du dictionnaire s'affiche telle quelle, ce qui permet
d'écrire directement `description: "répond pong"` quand une seule langue suffit.

| champ | rôle |
| --- | --- |
| `action` | le texte affiché, déjà traduit |
| `effect` | l'effet de bord ; la commande attaque votre état elle-même |
| `JSX` | rendu React sous la sortie, pour une commande qui affiche mieux qu'un texte |
| `help` | l'aide ; une fonction si elle dépend de l'état, comme celle de `lang` |
| `testArgs` | arguments acceptés (`authorize`, `empty`) ; `authorize` accepte une fonction |
| `display` | animation, styles, coloration personnalisée |
| `restricted` | vraie si le visiteur ne peut pas la taper ; réservée au code |

## La fenêtre

`Window` est un composant à part, qui ne sait rien du shell : un cadre rétro —
barre de titre à glisser, agrandissement, fermeture — autour de ce qu'on met
dedans. Il prend des `children`, et le shell n'en est qu'un parmi d'autres.

Sa ref est le contenu défilant du cadre : c'est ce que `scrollRef` attend, et
le shell fait alors descendre la fenêtre à mesure que la sortie s'allonge.

```tsx
import { Shell, Window, baseCommands } from "flower-shell"

// container borne le déplacement, content est ce qui défile
const container = useRef<HTMLDivElement>(null)
const content = useRef<HTMLDivElement>(null)

;<div ref={container} style={{ position: "relative", height: "100vh" }}>
	<Window
		ref={content}
		show={true}
		title="flower-shell"
		container={container}
		onClose={onClose}
	>
		<Shell commands={baseCommands} scrollRef={content} />
	</Window>
</div>
```

| prop de `Window` | rôle |
| --- | --- |
| `children` | ce que le cadre contient |
| `show` | montée ou non ; la fermeture s'anime avant de démonter |
| `container` | le cadre borne le déplacement à cet élément |
| `title` | le texte de la barre |
| `bottomInset` | hauteur réservée en bas, pour une barre des tâches |
| `compact` | pleine et non redimensionnable |
| `layer` | étage d'empilement |
| `rank` | rang dans la cascade, pour ne pas s'ouvrir sur la précédente |
| `onFocus` / `onClose` | la fenêtre réclame le premier plan, ou se ferme |

`compact` retire le bouton d'agrandissement et le double-clic. Le paquet ne
fixe aucun seuil : c'est à qui l'affiche de décider quand — petit écran, mode
lecture, préférence.

## Le balisage du texte

Les réponses passent par une passe de coloration. Chaque couleur du thème a
son marqueur :

| marqueur | effet |
| --- | --- |
| `§texte§` | couleur d'accent |
| `+texte+` | couleur d'information |
| `` `texte` `` | couleur des commandes |
| `!texte!` | couleur du restreint |
| `$texte$` | couleur de marque |
| `_texte_` | la couleur du fond : invisible jusqu'à la sélection |
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
		en: { app: { welcome: "Type `help`" } },   // l'anglais du paquet, plus votre clé
		de: dictDe,                                 // le vôtre, écrit chez vous
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

| nom | |
| --- | --- |
| `flower` | **le défaut** — feuillage sombre, une fleur pour invite |
| `twilight` | un terminal sombre et neutre, invite `>` |
| `parchment` | un terminal clair et neutre |
| `dracula` | fond ardoise violette, accents saturés |
| `nord` | fond bleu nuit, accents froids |
| `gruvbox` | fond terreux, accents chauds |
| `monokai` | fond olive sombre, accents francs |
| `solarized` | fond ivoire, accents mesurés |

Chacun s'exporte sous son nom — `flowerTheme`, `twilightTheme`, `nordTheme`… —
et `themes` les rassemble sous les clés du tableau :

```tsx
import { Shell, baseCommands, nordTheme, themes } from "flower-shell"

<Shell commands={baseCommands} />                        // flowerTheme
<Shell commands={baseCommands} theme={nordTheme} />
<Shell commands={baseCommands} theme={themes.gruvbox} />
```

Le visiteur, lui, en change à la volée : la commande `theme <nom>` accepte
exactement les clés de `themes`, et `help theme` les liste — chacune décrite
par la clé de dictionnaire `theme.<nom>`.

Un thème se remplace aussi par morceaux :

```tsx
<Shell
	commands={commands}
	theme={{
		colors: { background: "#212E35", importantColor: "#FFCC6A" },
		prompt: "🌼",
		fonts: { shell: "monospace", window: "monospace" },
		window: { titleBar: "#ed612e", content: "#f4ebda" },
		container: { padding: "16px" },
	}}
/>
```

Les valeurs absentes gardent celles de `defaultTheme`, y compris à
l'intérieur d'un groupe : ne donner que `colors.background` laisse les autres
couleurs en place.

`container` est le style du conteneur général du terminal, un
`CSSProperties` complet posé en inline sur lui : la marge intérieure est le
besoin courant — elle vaut `16px` par défaut — mais un arrondi, une bordure ou
une ombre se posent au même endroit. Ce qu'on y met recouvre le style de base
du conteneur, propriété par propriété.

Les deux polices sont séparées — un terminal veut du chasse fixe, un cadre pas
forcément — et valent `monospace` par défaut. Le cadre pose la sienne
explicitement : sans elle, il hériterait de la page qui l'accueille.

## Hors composant

L'état vit dans des modules, pas dans un contexte : une commande peut donc être
jouée depuis n'importe où — une fenêtre qui se ferme, un jeu qui se termine.

```ts
import { run, runRestricted, shellActions, useLang } from "flower-shell"

run("help")             // comme si le visiteur l'avait tapée
runRestricted("title")  // une commande que le visiteur ne peut pas taper
shellActions().setLang("en")
shellActions().reset()   // historique vide, options par defaut
```

**Conséquence assumée : un shell par page.** Le registre des commandes et le
thème sont des modules ; deux terminaux monteraient l'un sur l'autre.

## Développer

```sh
npm run storybook   # le terminal seul, sans le reste du site
```

Les stories sont sous `src/stories`, une par cas : le shell nu, avec des
commandes personnalisées, dans une fenêtre, dans chaque langue. Chacune montre
le code qui la produit, imports compris.

**Shell / Theme builder** est un créateur de thème : on part d'un thème du
catalogue, on déplace les couleurs, l'aperçu suit, et le bloc du bas est la
prop `theme` correspondante — à copier telle quelle.

**Markup** documente le balisage, marqueur par marqueur : les couleurs, les
tags, l'échappement.

## Licence

MIT.
