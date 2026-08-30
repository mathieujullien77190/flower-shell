**English** · [Français](./README.fr.md)

# flower-shell

A retro terminal in React: a command engine, history, autocompletion, animated
ASCII rendering, and a window to put it in. No layout imposed.

```tsx
import { Shell, baseCommands } from "flower-shell"

const App = () => <Shell commands={baseCommands} />
```

## The component

| prop | role |
| --- | --- |
| `commands` | the known commands, indexed by name: the ones shipped with the package, plus yours; optional |
| `initialCommands` | commands played at startup, once; this is where the opening goes |
| `theme` | the theme worn at startup; colours, prompt, fonts |
| `themes` | the themes the visitor can reach, one per name; without it, the package catalogue |
| `dict` | the languages of the shell, one dictionary per language; without it, English alone |
| `lang` | starting language, among those of `dict` (`en` by default) |
| `scrollRef` | element to scroll as the output grows |
| `onCommand` | called on every command played, the package ones included |

Every prop is optional: `<Shell />` mounts bare. With an empty registry it
shows the prompt and answers nothing — a typed line moves on to the next, with
no error message. As soon as one command exists, an unknown command becomes an
error again.

## The base commands

`help`, `clear`, `hello`, `flowers`, `animation`, `lang` and `theme`.

`test` is exported on its own, beside `baseCommands`, and mounted by hand: it
is a workbench, not something a visitor of yours needs to find.

```tsx
import { Shell, baseCommands, test } from "flower-shell"

<Shell commands={{ ...baseCommands, test }} />
```

It prints every colour of the theme, the source on the left and its render on
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
	dict={{ en: { welcome: { text: "Welcome to $acme$ — type `help` to look around" } } }}
/>
```

`initialCommands` only plays once, on a blank screen: a `clear` does not
replay them. `clear` wipes the screen and does nothing else — bringing
something back after it is yours to write, from `onCommand` and
`runRestricted`.

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

| field | role |
| --- | --- |
| `action` | the text displayed, already translated |
| `effect` | the side effect; the command reaches your state itself |
| `JSX` | React render under the output, for a command that shows better than it tells |
| `help` | the help; a function when it depends on state, like the one of `lang` |
| `testArgs` | accepted arguments (`authorize`, `empty`); `authorize` accepts a function |
| `display` | animation, styles, custom colouring |
| `restricted` | true when the visitor cannot type it; reserved for code |

## The window

`Window` is a component of its own, and it knows nothing about the shell: a
retro frame — draggable title bar, maximise, close — around whatever you put
inside. It takes `children`, and the shell is only one of them.

Its ref is the scrollable content of the frame: that is what `scrollRef`
expects, and the shell then scrolls the window down as the output grows.

```tsx
import { Shell, Window, baseCommands } from "flower-shell"

// container bounds the movement, content is what scrolls
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

| `Window` prop | role |
| --- | --- |
| `children` | what the frame holds |
| `show` | mounted or not; closing animates before unmounting |
| `container` | the frame bounds its movement to this element |
| `title` | the text of the bar |
| `bottomInset` | height reserved at the bottom, for a taskbar |
| `compact` | full and not resizable |
| `layer` | stacking floor |
| `rank` | rank in the cascade, so as not to open on top of the previous one |
| `onFocus` / `onClose` | the window asks for the front, or closes |

`compact` removes the maximise button and the double-click. The package sets no
threshold: it is up to whoever displays it to decide when — small screen,
reading mode, preference.

## Text markup

Answers go through a colouring pass. Each theme colour has its own marker:

| marker | effect |
| --- | --- |
| `§text§` | accent colour |
| `+text+` | info colour |
| `` `text` `` | command colour |
| `!text!` | restricted colour |
| `$text$` | brand colour |
| `_text_` | the background colour: invisible until selected |
| `#label ~ cmd args#` | clickable and underlined: the click plays `cmd` with its arguments |

A marker in brackets — `[+text+]` — becomes a tag: a solid background instead
of a text colour, the label in black or white depending on how light the
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
		en: { welcome: { text: "Type `help`" } },   // the package English, one key overridden
		de: dictDe,                                  // yours, written at home
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

| name | |
| --- | --- |
| `flower` | **the default** — dark foliage, a flower for a prompt |
| `twilight` | a dark, neutral terminal, `>` prompt |
| `parchment` | a light, neutral terminal |
| `dracula` | purple slate background, saturated accents |
| `nord` | night blue background, cold accents |
| `gruvbox` | earthy background, warm accents |
| `monokai` | dark olive background, plain accents |
| `solarized` | ivory background, measured accents |

Each is exported under its own name — `flowerTheme`, `twilightTheme`,
`nordTheme`… — and `themes` gathers all eight under the keys of the table.

Two props, and they answer two different questions. `theme` is the one the
shell wears at startup. `themes` is the catalogue the visitor can reach:

```tsx
import { Shell, baseCommands, nordTheme, themes } from "flower-shell"

<Shell commands={baseCommands} />                        // flowerTheme, all eight
<Shell commands={baseCommands} theme={nordTheme} />      // starts on nord
<Shell commands={baseCommands} themes={{ nord: nordTheme }} />  // and nothing else
```

**The themes of the shell are exactly the keys of `themes`** — nothing more.
`theme <name>` accepts those and no others, and `help theme` lists them, each
described by the `theme.<name>` dictionary key. Without the prop, the package
catalogue in full.

So a shell of your own, with one theme of the package, one of yours, and no
way out of the two:

```tsx
<Shell
	commands={baseCommands}
	themes={{ nord: nordTheme, mine }}
	theme={mine}
	dict={{ en: { theme: { mine: "The house theme" } } }}
/>
```

A theme — mounted or handed to `theme` — can be written piece by piece:

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

Absent values keep those of `defaultTheme`, inside a group included: giving
only `colors.background` leaves the other colours in place. A mounted theme is
laid on `defaultTheme` and not on the one it replaces, so switching to it
gives the same result whichever theme you are leaving.

`container` is the style of the terminal outer container, a full
`CSSProperties` laid inline on it: the padding is the common need — it is
`16px` by default — but a radius, a border or a shadow go in the same place.
What you put there overrides the base style of the container, property by
property.

The two fonts are separate — a terminal wants a fixed pitch, a frame not
necessarily — and are `monospace` by default. The frame sets its own
explicitly: without it, it would inherit from the page holding it.

## Outside the component

State lives in modules, not in a context: a command can therefore be played
from anywhere — a window that closes, a game that ends.

```ts
import { run, runRestricted, shellActions, useLang } from "flower-shell"

run("help")             // as if the visitor had typed it
runRestricted("title")  // a command the visitor cannot type
shellActions().setLang("en")
shellActions().reset()   // empty history, default options
```

**An accepted consequence: one shell per page.** The command registry and the
theme are modules; two terminals would mount on top of each other.

## Developing

```sh
npm run storybook   # the terminal alone, without the rest of the site
```

The stories live under `src/stories`, one per case: the bare shell, with custom
commands, in a window, in each language. Each shows the code that produces it,
imports included.

**Shell / On command** puts a panel beside the terminal and fills it from
`onCommand` alone: one line per command played, with its arguments. It is
where to look to see what the shell hands back — `clear` included.

**Shell / Theme builder** is a theme maker: you start from a theme of the
catalogue, move the colours, the preview follows, and the block at the bottom
is the matching `theme` prop — to be copied as-is.

**Markup** documents the markup, marker by marker: the colours, the tags, the
escaping.

## Licence

MIT.
