[Read me in English](./README.md)

# flower-shell

Un terminal rétro en React : moteur de commandes, historique, autocomplétion
et rendu ASCII animé.

Pour l'implémentation, veuillez vous reporter au
[Storybook](https://mathieujullien77190.github.io/flower-shell/) : tout y est
expliqué, et vous y trouverez de nombreux exemples d'utilisation.

## Le composant

**Toutes les props sont facultatives**, et ce qu'on laisse de côté n'existe
pas plutôt que de retomber sur autre chose. `<Shell />` se suffit à lui-même :
il se monte sur rien — aucune commande, donc une ligne tapée passe sans
erreur ; aucun thème, donc rien n'est peint et le shell prend les couleurs et
la police de la page qui le tient.

Il est conseillé de lui donner quand même les deux props qui en font un
terminal : les commandes auxquelles il répond, et les thèmes qu'il peut
porter. C'est la version minimale qui vaut la peine d'être montée.

```tsx
import { Shell, baseCommands, themes } from "flower-shell"

const App = () => <Shell commands={baseCommands} themes={themes} />
```

Le shell prend la place qu'on lui donne et rien de plus. Donnez une hauteur à
la boîte qui le tient et il défile dedans, en suivant sa dernière ligne
pendant qu'elle s'écrit.

### Ce qu'il connaît

| prop              | type           | défaut     | rôle                                                                                                                                                                                                          |
| ----------------- | -------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `commands`        | `BaseCommands` | `{}`       | Les commandes connues, indexées par le nom qui les invoque : `baseCommands` plus les vôtres. Ce sont exactement celles auxquelles le shell répond, celles que `help` liste et que [TAB] complète.             |
| `initialCommands` | `string[]`     | `[]`       | Les commandes jouées au démarrage, dans l'ordre du tableau, chacune comme si elle était tapée.                                                                                                                |
| `dict`            | `Dictionaries` | anglais    | Vos textes, par langue. Ils recouvrent ceux du paquet clé par clé, et une langue qu'il ne porte pas devient atteignable par `lang <code>`. Partagés par tous les terminaux de la page.                        |
| `lang`            | `string`       | `"en"`     | La langue sur laquelle il ouvre, une clé de `dict`. Appliquée après le montage, jamais pendant le rendu : la langue d'un navigateur n'existe pas au prérendu.                                                 |
| `themes`          | `ShellThemes`  | aucun      | Les thèmes que le visiteur peut prendre, indexés par le nom qu'il tape. Ce sont exactement ceux que `theme <nom>` accepte et que `help theme` liste. `themes={themes}` pour le catalogue entier, les huit.    |
| `theme`           | `string`       | le premier | Celui sur lequel il ouvre, une clé de `themes`. Un nom absent du catalogue est ignoré — il ne peut pas ouvrir sur un thème que le visiteur n'aurait aucun moyen de retrouver. Partagé par tous les terminaux. |
| `animation`       | `boolean`      | `true`     | L'écriture lettre par lettre des réponses. Une commande peut dire le contraire pour elle-même, par `display.animation`.                                                                                       |
| `keyboardOnFocus` | `boolean`      | `true`     | La saisie reprend le focus où que le clic ait atterri sur la page, pour qu'on puisse taper sans viser. Un clic sur le terminal lui-même lui rend le clavier de toute façon, option ou pas.                    |
| `id`              | `string`       | aucun      | Le nom sous lequel un `<ShellProvider>` au-dessus retrouve ce terminal, pour que `useShell()` y joue une ligne. Pas d'id, pas de commande ; sans provider au-dessus, il est ignoré.                           |

### Ce qu'il rapporte

Les quatre écouteurs prennent le même événement — `{ name, args, pattern }`,
la ligne telle qu'elle a été envoyée — et appartiennent à leur shell : deux
terminaux préviennent deux consommateurs.

| prop                | se déclenche                                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onCommandStart`    | Avant que la commande joue. Le shell ne sait pas encore s'il en a une de ce nom : celui-ci part donc aussi pour une ligne qu'il refusera juste après.                               |
| `onCommandDone`     | L'action a rendu son texte et l'effet a joué. Rien n'est encore à l'écran — l'écriture prend le temps de son animation. Seulement pour une commande qui a pu jouer.                 |
| `onCommandRendered` | La réponse a fini de s'écrire. Une fois par commande, au moment où ça arrive, jamais pour une commande qui n'a pas pu jouer.                                                        |
| `onCommandError`    | La commande n'a pas joué. `reason` vaut `unknown` (aucune commande de ce nom), `args` (elle existe, ses arguments ne passent pas) ou `thrown` — et l'erreur est alors dans `error`. |

Un shell sans aucune commande n'a rien à refuser : il laisse passer ce qu'on
tape et ne rapporte aucune erreur. Dès qu'une commande existe, un nom inconnu
redevient une erreur.

## Travailler sur le paquet

```sh
npm install
npm run storybook      # la documentation, sur localhost:6006
```

Avant d'ouvrir une pull request, les vérifications que joue la CI, de la plus
rapide à la plus lente :

```sh
npm run format:check         # prettier
npm run lint                 # eslint
npm run typecheck            # les sources
npm run typecheck:test       # les tests, sur leur propre tsconfig
npm run test:coverage:check  # les tests, et le plancher de couverture
npm run build                # ce qui est publié
```

Pendant qu'on écrit :

```sh
npm test               # une passe
npm run test:watch     # en continu
npm run test:detail    # chaque test nommé, un par ligne
npm run test:coverage  # la couverture, fichier par fichier
npm run format         # prettier, en écriture
npm run lint:fix       # eslint, qui corrige ce qu'il peut
```

**Le plancher de couverture est à cent pour cent** — lignes, instructions,
branches et fonctions — donc une ligne ajoutée sans test fait échouer la
passe. La réponse à une passe rouge est un test, jamais un plancher plus bas :
du code qu'aucun test n'atteint est du code à supprimer.

Les deux README disent la même chose en deux langues et sont tous les deux
maintenus. Une modification de l'un part dans l'autre, traduite, à la même
place, dans le même commit.

## Signaler un bug, demander une fonctionnalité

Les deux passent par les
[issues](https://github.com/mathieujullien77190/flower-shell/issues).
Cherchez d'abord dans celles qui sont ouvertes — la vôtre y est peut-être
déjà, et l'enrichir vaut mieux que d'en ouvrir une seconde.

**Un bug** vaut d'être signalé quand quelqu'un d'autre peut le reproduire.
Donnez la version du paquet, la version de React, ce que vous avez fait, ce
que vous attendiez et ce qui est arrivé à la place. Un `<Shell>` minimal qui
le montre — les props, la commande tapée — vaut mieux qu'une description, et
un lien Storybook vaut mieux encore.

**Une fonctionnalité** part du besoin et non de la solution : dites ce que
vous cherchez à faire et ce qui vous bloque aujourd'hui. Dites si l'API
actuelle peut être pliée à ce besoin, et si le changement casserait ce qui est
déjà publié. Ce que le paquet ne fera pas : imposer une mise en page, ou
livrer des commandes pour un domaine précis — c'est ce à quoi sert `commands`.

Une pull request est bienvenue sur une issue qui a été discutée. Un seul sujet
par PR, avec les tests qui la tiennent, et les deux README à jour si elle
touche à l'API publique.
