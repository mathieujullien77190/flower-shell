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
| `id`                | the name a `<ShellProvider>` finds it under, so `useShell()` can command it                                                         |
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

A click on the terminal always hands the keyboard to its input.
`keyboardOnFocus` covers the rest of the page: on, which is the default, the
input takes the focus back wherever the click landed, so one can type without
aiming; off, the shell waits to be clicked — which is what a page holding
fields of its own wants.

## Height and scroll

The shell takes the room it is given: give the box that holds it a height, and
it scrolls inside it — a long output stays in the terminal, on a scrollbar of
the theme, and the shell follows its last line as it is written.

```tsx
<div style={{ height: "100vh" }}>
	<Shell commands={baseCommands} themes={themes} />
</div>
```

There is nothing to hand over: the scroll belongs to the shell. A box of no
height leaves the terminal growing with its output, as tall as what it holds,
and nothing scrolls — the page then scrolls instead, if it is long enough.

## The base commands

`help`, `clear`, `hello`, `flowers`, `animation`, `font`, `lang` and
`theme`.

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

## Completion

[TAB] completes the line being typed: the name of the command first, then its
first argument once the command is named. `anim` gives `animation`,
`theme lav` gives `theme lavender`, `lang f` gives `lang fr`.

The values come from `testArgs.authorize`, the very list that turns a wrong
argument down — so a command of yours completes on its own as soon as it
declares one, and a command taking free text, like `hello`, has nothing to
guess. Only the first argument is completed.

On a phone there is no [TAB]: [ENTER] takes the suggestion instead of sending
the line, and the next one sends it.

The hint shown under the line comes from the dictionary like the rest, under
`input.predict` — `{word}` is what would be taken, `{key}` the key that takes
it. Override that key through `dict` to word it your way.

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
something back after it is yours to write, from `onCommandDone` and a named
shell reached through `useShell()`.

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

## Accessibility

The terminal is usable without a mouse and without the screen.

`font +` and `font -` grow and shrink the text, two pixels a step, between 10
and 40; `font reset` gives the size back to the theme. It belongs to the
shell and not to the theme: two terminals on the same page zoom apart, and a
theme changed under a zoomed shell keeps the size the visitor set.

The output is a log region — `role="log"`, announced as it fills — and a
command being written letter by letter is held `aria-busy` until it is done:
a screen reader reads the answer once, whole, and not one letter at a time.
The input carries its own name, the prompt is hidden from the reading (a
flower announced before every line is noise), and the hint of the completion
is tied to the field, so it is read after it.

A clickable marker — `#label ~ cmd#` — is a button: it takes the tab order,
[ENTER] and [SPACE] play it. It could only be reached with a mouse before.

The two texts come from the dictionary like the rest, under `input.label` and
`terminal.output`, and are overridden through `dict` like any other key.

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

The package ships eight, each one wearing its emoji for a prompt. Seven are
named after a thing that grows — four dark, three light, around the one the
package is named after. The eighth is not there to be looked at:

| name       |                                                               |
| ---------- | ------------------------------------------------------------- |
| `flower`   | 🌼 **the default** — dark foliage, a flower for a prompt      |
| `hibiscus` | 🌺 dark — wine background, petal pink and pollen yellow       |
| `kiwi`     | 🥝 dark — husk background, flesh green and seed ring          |
| `contrast` | 🌻 dark — **made to be read**: white on black, bigger letters |
| `maple`    | 🍁 dark — bark background, the gold and red of the leaf       |
| `lavender` | 🪻 light — pale lilac, violet and the grey green of the stems |
| `rice`     | 🌾 light — straw, grain gold and the water of the paddy       |
| `nest`     | 🪺 light — shell beige, twig brown and egg blue               |

Each is exported under its own name — `flowerTheme`, `hibiscusTheme`,
`lavenderTheme`… — and `themes` gathers all eight under the keys of the table.

`contrast` is the accessibility theme: pure white on pure black, every accent
kept above a contrast ratio of 7:1 on that ground — what WCAG asks at its
highest level — and `fonts.size` raised to 20. Its prompt is the sunflower
worn by whoever carries something that does not show. Mount it beside the
others and `theme contrast` is one line away for whoever needs it.

Two props, and they read like `dict` and `lang`. `themes` says which themes
exist; `theme` names the one it starts on, a key of `themes`:

```tsx
import { Shell, baseCommands, lavenderTheme, themes } from "flower-shell"

// the whole catalogue: all eight, worn on the first of them
<Shell commands={baseCommands} themes={themes} />

// one of them, and nothing else to switch to
<Shell commands={baseCommands} themes={{ lavender: lavenderTheme }} />

// the catalogue to reach, and the name it starts on
<Shell commands={baseCommands} themes={themes} theme="lavender" />

// neither: nothing to switch to, and nothing painted
<Shell commands={baseCommands} />
```

**The themes of the shell are exactly the keys of `themes`** — nothing more.
`theme <name>` accepts those and no others, and `help theme` lists them, each
described by the `theme.<name>` dictionary key, its tone first:

```
theme rice      : light : Straw ground, grain gold and the water of the paddy
theme maple     : dark : Bark dark ground, the gold and the red of the leaf
```

`light` or `dark` is read off `colors.background`, not off a word in the
description — so a theme of yours is announced like the others, without
writing it anywhere. A background it cannot be read from — a named color,
`transparent` — leaves the line as it was.

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
	themes={{ lavender: lavenderTheme, mine }}
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
`maple` barely rounds its corners, `rice` widens its margins. Since a
mounted theme is laid on `defaultTheme`, a theme of yours that says nothing
about `container` inherits the one of `flower`; give it a `container` of its
own to say otherwise.

`colors.scrollbarThumb` and `colors.scrollbarTrack` dress the scrollbar of the
terminal: the thumb one drags, and the groove it slides in. Both are optional
— a theme that says nothing about them gets its own text color on its own
background, which goes with any palette — and the bar is drawn thin. Only
`bareTheme` leaves the scrollbar of the browser untouched, the way it paints
nothing else.

```tsx
const mine = {
	colors: { background: "#212E35", scrollbarThumb: "#FFCC6A" },
}
```

`fonts.shell` dresses the output and the input alike, and is `monospace` by
default: a terminal wants a fixed pitch. `fonts.size` is the size of the
shell in pixels, 16 by default: the output, the input and the ASCII art are
all measured on it, and a theme meant to be read from far — or read badly —
raises it, the way `contrast` does.

`fonts.logo` is the size of the logo, the ASCII art the `title` command
draws. A CSS length and not a number of pixels — `calc(100cqw / 90)` by
default — because it is written on the width of the container: the logo then
keeps its shape whatever the terminal is served in. A theme wanting it bigger
divides by less.

```tsx
const mine = {
	fonts: { size: 20, logo: "calc(100cqw / 70)" },
}
```

## Several terminals, and how to command one

Each shell owns its history, its cursor and its options, so several can live
on the same page and never meet. Two of them side by side keep two histories
and can answer in two languages, out of the same `dict`.

**No id, no commanding.** A terminal is reachable only if it was named, and
`<ShellProvider>` is where those names are looked up. Nothing has to guess
which shell was meant, because a shell that says nothing is not addressable at
all.

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

| `useShell()`                 | role                                              |
| ---------------------------- | ------------------------------------------------- |
| `run(id, pattern)`           | plays a line as if the visitor had typed it       |
| `runRestricted(id, pattern)` | plays a line the visitor cannot type              |
| `actions(id)`                | the state of that shell: history, cursor, options |

`actions(id)` reads fresh on every call, and carries the setters the commands
use — `setLang`, `setAnimation`, `reset`, and the rest.

The id is read when the method is called, not when the hook runs: a toolbar
placed before the terminals in the tree renders before they exist, and by the
time anyone clicks they are there. An id that is not mounted throws, and says
which ones are.

Outside React there is no hook to call: take `useShell()` in a component of
yours and keep the methods wherever you need them.

**What is shared, and why.** The theme and the dictionaries stay in modules,
common to every terminal on the page: the markup is coloured by `highlight`,
a function and not a component, and a context would not reach it. So
`theme lavender` typed in one shell repaints the others, while the language, the
history and the options belong to each.

A command reaches its own shell without asking: inside an `action` or an
`effect`, `t()` speaks the language of the shell in play and `shellActions()`
returns its state. That holds for as long as the command runs, which is
synchronous — an `effect` that awaits something and touches the state
afterwards is outside that window, and needs `useShell()` and an id.

## Developing

```sh
npm run storybook   # the terminal alone, without the rest of the site
```

The stories live under `src/stories`, one per case: the bare shell, with custom
commands, two of them commanded by one toolbar, in each language. Each shows the code that
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
