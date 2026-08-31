Language: [Français](./README.fr.md)

Online documentation: [Storybook](https://mathieujullien77190.github.io/flower-shell/)

# flower-shell

A retro terminal in React: a command engine, history, autocompletion and
animated ASCII rendering. No layout imposed.

```tsx
import { Shell, baseCommands, themes } from "flower-shell"

const App = () => <Shell commands={baseCommands} themes={themes} />
```

## The component

| prop                | role                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `commands`          | the known commands, indexed by name: the ones shipped with the package, plus yours; optional                                        |
| `initialCommands`   | commands played at startup, once; this is where the opening goes                                                                    |
| `theme`             | the name of the theme it starts on, a key of `themes`; without it, the first of them — and without those either, nothing is painted |
| `themes`            | the themes the visitor can reach, one per name; `themes={themes}` for the whole catalogue                                           |
| `dict`              | the languages of the shell, one dictionary per language; without it, English alone                                                  |
| `lang`              | starting language, among those of `dict` (`en` by default)                                                                          |
| `animation`         | letter by letter writing of the answers (`true` by default)                                                                         |
| `keyboardOnFocus`   | the input takes the focus back as soon as it loses it (`true` by default)                                                           |
| `scrollRef`         | element to scroll as the output grows: the box holding the shell                                                                    |
| `ref`               | the handle on this terminal: `run`, `runRestricted`, `actions()`                                                                    |
| `onCommandStart`    | before the command runs; fires for an unknown one too                                                                               |
| `onCommandDone`     | the action returned its text and the effect played; nothing on screen yet                                                           |
| `onCommandRendered` | the text has finished being written                                                                                                 |
| `onCommandError`    | the command did not play; `reason` says why                                                                                         |

Every prop is optional, and what is left out simply does not exist. `<Shell />`
mounts on nothing: an empty registry, so a typed line moves on to the next with
no error message, and no theme, so nothing is painted — the shell takes the
colors and the font of the page that holds it, the prompt falls back to `>`,
and the markup stops coloring. As soon as one command exists, an unknown
command becomes an error again.

## The base commands

`help`, `clear`, `hello`, `flowers`, `animation`, `lang` and `theme`.

`test` is exported on its own, beside `baseCommands`, and mounted by hand: it
is a workbench, not something a visitor of yours needs to find.

```tsx
import { Shell, baseCommands, test } from "flower-shell"

;<Shell commands={{ ...baseCommands, test }} />
```

It prints every color of the theme, the source on the left and its render on
the right — enough to judge a palette, or to find the markup syntax again
without opening this page — and it ends on a clickable marker that really
runs `hello` when you click it.

Plus the restricted commands — ones the visitor cannot type:

- `title` prints the ASCII logo of the shell and `welcome` the text of the
  `welcome.text` key. They are commands like any other — their text lives in
  the dictionary, and you put your own words there by overriding that key
  through `dict`. You play them by putting them in `initialCommands`. Without
  that the shell starts bare, and you put your own mark on it
- `unknow` and `argumenterror` are looked up **by name** by the engine, which
  renders their text when a command is unknown or badly called. Removing them
  is allowed: the package dictionary takes over, and `commands={{}}` remains a
  valid shell, one that simply answers nothing
- `actionmap` is the router of the clickable markers: a click on
  `#label ~ cmd args#` sends it `cmd args`, and its effect plays that line. It
  shows nothing of its own — remove it and a click does nothing

## The opening

The shell starts bare. The logo and the welcome message are two commands,
played like any other:

```tsx
<Shell commands={baseCommands} initialCommands={["title", "welcome"]} />
```

`welcome` prints the `welcome.text` key, which the package already carries. To
put your own words there, override that key like any other:

```tsx
<Shell
	commands={baseCommands}
	initialCommands={["title", "welcome"]}
	dict={{
		en: { welcome: { text: "Welcome to $acme$ — type `help` to look around" } },
	}}
/>
```

`initialCommands` only plays once, on a blank screen: a `clear` does not
replay them. `clear` wipes the screen and does nothing else — bringing
something back after it is yours to write, from `onCommandDone` and the
handle of the shell.

## Watching the commands

Four props, four moments. Each is handed one object, the same shape
throughout:

```tsx
<Shell
	commands={baseCommands}
	onCommandStart={event => console.log("about to run", event.pattern)}
	onCommandDone={event => console.log("ran", event.name, event.args)}
	onCommandRendered={event => console.log("written out", event.name)}
	onCommandError={event => console.error(event.reason, event.pattern)}
/>
```

| field     |                                |
| --------- | ------------------------------ |
| `name`    | the first word of the line     |
| `args`    | the rest of it, word by word   |
| `pattern` | the whole line, as it was sent |

`onCommandStart` fires before anything runs, off that line. At that point the
shell does not yet know whether it has a command of that name, so this one
**also fires for a line it will refuse** — which is what makes it the place to
watch everything typed.

`onCommandDone` fires once the action has returned its text and the effect has
played. The command is over; nothing is on screen yet.

`onCommandRendered` fires when the text has finished being written. On a long
output that is a good while after `onCommandDone` — the animation writes it
letter by letter. It fires once per command, on the crossing.

`onCommandError` fires **instead of** `onCommandDone` when the command did not
play, and adds `reason` to the object:

| `reason`  |                                                                |
| --------- | -------------------------------------------------------------- |
| `unknown` | no command of that name in the registry                        |
| `args`    | the command exists, its arguments do not pass                  |
| `thrown`  | its action or its effect threw; the throw itself is in `error` |

A shell with an empty registry has nothing to object to — it lets a typed line
through on purpose — so it reports no error at all.

## Writing a command

```tsx
const ping: BaseCommand = {
	restricted: false,
	action: () => t("ping.pong"),
	effect: () => console.log("played"),
	help: {
		patterns: [{ pattern: "ping", description: "ping.usage" }],
	},
}

const commands: BaseCommands = { ...baseCommands, ping }
```

The name that invokes the command is its key in the object: there is no `name`
field.

A text is **always a `string`**. Inside an `action`, calling `t("key")` is up
to you — so you can mix: `` `${t("ping.pong")} ${name}` ``. In the static
fields (`help.description`, a pattern `description`) you write **the key** and
the shell translates it when it uses it. A key missing from the dictionary
shows as-is, which lets you write `description: "answers pong"` directly when
one language is enough.

| field        | role                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| `action`     | the text displayed, already translated                                       |
| `effect`     | the side effect; the command reaches your state itself                       |
| `JSX`        | React render under the output, for a command that shows better than it tells |
| `help`       | the help; a function when it depends on state, like the one of `lang`        |
| `testArgs`   | accepted arguments (`authorize`, `empty`); `authorize` accepts a function    |
| `display`    | animation, styles, custom coloring                                           |
| `restricted` | true when the visitor cannot type it; reserved for code                      |

## Text markup

Answers go through a coloring pass. Each theme color has its own marker:

| marker               | effect                                                             |
| -------------------- | ------------------------------------------------------------------ |
| `§text§`             | accent color                                                       |
| `+text+`             | info color                                                         |
| `` `text` ``         | command color                                                      |
| `!text!`             | restricted color                                                   |
| `$text$`             | brand color                                                        |
| `_text_`             | the background color: invisible until selected                     |
| `#label ~ cmd args#` | clickable and underlined: the click plays `cmd` with its arguments |

A marker in brackets — `[+text+]` — becomes a tag: a solid background instead
of a text color, the label in black or white depending on how light the
background is.

A backslash before a marker prints it as-is: `\+` gives `+`. A backslash with
no marker behind it stays as-is, so there is no need to escape it.

## Languages

The package ships its texts in two dictionaries — `dictEn` and `dictFr`, one
file each — but mounts **only one by default: English**. The languages of the
shell are exactly the keys of the `dict` prop:

```tsx
import { Shell, baseCommands, dictEn, dictFr } from "flower-shell"

<Shell commands={baseCommands} />                                            // en
<Shell commands={baseCommands} lang="fr" dict={{ en: dictEn, fr: dictFr }} />
```

`lang` picks the starting one; the `lang` command only accepts those that are
mounted, and its help lists them — each describes itself through the
`lang.<code>` key, to be provided in your dictionary for your language.

For another language, you write the dictionary, on the model of the package
ones. Every mounted language is laid **on top of English**: a key your
dictionary does not cover comes out in English rather than as a bare key, and
you can add a single text without losing the others.

```tsx
<Shell
	commands={commands}
	lang="de"
	dict={{
		en: { welcome: { text: "Type `help`" } }, // the package English, one key overridden
		de: dictDe, // yours, written at home
	}}
/>
```

`t("hello.world")` reads the current language, falls back to English, then to
the key itself. `t("lang.set", { lang: "fr" })` replaces the `{name}` slots of
the text.

**Translation happens when the command runs**, and the result is stored as-is.
After a `lang en`, the lines already displayed therefore stay in their original
language; only the following ones change.

## The theme

The package ships eight, in the manner of an editor:

| name        |                                                       |
| ----------- | ----------------------------------------------------- |
| `flower`    | **the default** — dark foliage, a flower for a prompt |
| `twilight`  | a dark, neutral terminal, `>` prompt                  |
| `parchment` | a light, neutral terminal                             |
| `dracula`   | purple slate background, saturated accents            |
| `nord`      | night blue background, cold accents                   |
| `gruvbox`   | earthy background, warm accents                       |
| `monokai`   | dark olive background, plain accents                  |
| `solarized` | ivory background, measured accents                    |

Each is exported under its own name — `flowerTheme`, `twilightTheme`,
`nordTheme`… — and `themes` gathers all eight under the keys of the table.

Two props, and they read like `dict` and `lang`. `themes` says which themes
exist; `theme` names the one it starts on, a key of `themes`:

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

**The themes of the shell are exactly the keys of `themes`** — nothing more.
`theme <name>` accepts those and no others, and `help theme` lists them, each
described by the `theme.<name>` dictionary key.

Neither prop is required, and neither has a fallback that dresses the shell
behind your back. `theme` names what it wears; without it, the first entry of
`themes`; without those either, `bareTheme` — transparent background,
inherited colors and font, `>` for a prompt, and a markup that no longer
colors anything. What you do not hand over is not painted.

A name that is not in the catalogue is ignored rather than quietly mounted:
starting on a theme the visitor could never get back to is something neither
`theme <name>` nor `help theme` could explain.

So a shell of your own, with one theme of the package, one of yours, and no
way out of the two:

```tsx
<Shell
	commands={baseCommands}
	themes={{ nord: nordTheme, mine }}
	theme="mine"
	dict={{ en: { theme: { mine: "The house theme" } } }}
/>
```

A theme is written piece by piece, and mounted under the name the visitor will
type:

```tsx
const mine = {
	colors: { background: "#212E35", importantColor: "#FFCC6A" },
	prompt: "🌼",
	fonts: { shell: "monospace" },
	container: { padding: "16px" },
}

<Shell commands={commands} themes={{ mine }} theme="mine" />
```

Absent values keep those of `defaultTheme`, inside a group included: giving
only `colors.background` leaves the other colors in place. A mounted theme is
laid on `defaultTheme` and not on the one it replaces, so switching to it
gives the same result whichever theme you are leaving.

`container` is the style of the terminal outer container, a full
`CSSProperties` laid inline on it: the padding is the common need — it is
`16px` by default — but a radius, a border or a shadow go in the same place.
What you put there overrides the base style of the container, property by
property.

The eight shipped themes each style theirs: a border in the colors of the
palette, a radius that goes with them, and the room the theme calls for —
`monokai` squares its corners, `parchment` widens its margins. Since a
mounted theme is laid on `defaultTheme`, a theme of yours that says nothing
about `container` inherits the one of `flower`; give it a `container` of its
own to say otherwise.

`fonts.shell` dresses the output and the input alike, and is `monospace` by
default: a terminal wants a fixed pitch.

## Several terminals, and the handle

Each shell owns its history, its cursor and its options, so several can live
on the same page and never meet. Two of them side by side keep two histories
and can answer in two languages, out of the same `dict`.

A line reaches one of them from outside React through its `ref`:

```tsx
import { useRef } from "react"
import { Shell, baseCommands } from "flower-shell"
import type { ShellHandle } from "flower-shell"

const terminal = useRef<ShellHandle>(null)

;<>
	<button onClick={() => terminal.current?.run("help")}>help</button>
	<Shell ref={terminal} commands={baseCommands} />
</>
```

| handle          | role                                              |
| --------------- | ------------------------------------------------- |
| `run`           | plays a line as if the visitor had typed it       |
| `runRestricted` | plays a line the visitor cannot type              |
| `actions()`     | the state of that shell: history, cursor, options |

`actions()` reads fresh on every call, and carries the setters the commands
use — `setLang`, `setAnimation`, `reset`, and the rest.

**What is shared, and why.** The theme and the dictionaries stay in modules,
common to every terminal on the page: the markup is coloured by `highlight`,
a function and not a component, and a provider would not reach it. So
`theme nord` typed in one shell repaints the others, while the language,
the history and the options belong to each.

A command reaches its own shell without asking: inside an `action` or an
`effect`, `t()` speaks the language of the shell in play and
`shellActions()` returns its state. That holds for as long as the command
runs, which is synchronous — an `effect` that awaits something and touches
the state afterwards is outside that window and needs the handle.

## Developing

```sh
npm run storybook   # the terminal alone, without the rest of the site
```

The stories live under `src/stories`, one per case: the bare shell, with custom
commands, two of them side by side, in each language. Each shows the code that
produces it, imports included.

**Shell / Events** puts a panel beside the terminal and fills it from the four
event props alone: one row per command, a tick under each moment it has
reached. Every event is also logged in full to the browser console — open it,
that is where the arguments and the whole line are. Type `title` and watch the
gap between the last two ticks, that is the animation; then `nope`,
`theme nope` and `boom`, one for each reason an error carries.

**Shell / Theme builder** is a theme maker: you start from a theme of the
catalogue, move the colors, the preview follows, and the block at the bottom
is the matching `theme` prop — to be copied as-is.

**Markup** documents the markup, marker by marker: the colors, the tags, the
escaping.

## Licence

MIT.
