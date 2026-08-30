Language: [Français](./README.fr.md)

Online documentation: [Storybook](https://mathieujullien77190.github.io/flower-shell/)

# flower-shell

A retro terminal in React: a command engine, history, autocompletion, animated
ASCII rendering, and a window to put it in. No layout imposed.

```tsx
import { Shell, baseCommands, themes } from "flower-shell"

const App = () => <Shell commands={baseCommands} themes={themes} />
```

## The component

| prop | role |
| --- | --- |
| `commands` | the known commands, indexed by name: the ones shipped with the package, plus yours; optional |
| `initialCommands` | commands played at startup, once; this is where the opening goes |
| `theme` | the name of the theme it starts on, a key of `themes`; without it, the first of them — and without those either, nothing is painted |
| `themes` | the themes the visitor can reach, one per name; `themes={themes}` for the whole catalogue |
| `dict` | the languages of the shell, one dictionary per language; without it, English alone |
| `lang` | starting language, among those of `dict` (`en` by default) |
| `window` | puts the shell in a frame; the object holds everything the frame can do |
| `scrollRef` | element to scroll as the output grows; ignored with `window` |
| `onCommandStart` | before the command runs; fires for an unknown one too |
| `onCommandDone` | the action returned its text and the effect played; nothing on screen yet |
| `onCommandRendered` | the text has finished being written |
| `onCommandError` | the command did not play; `reason` says why |

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

<Shell commands={{ ...baseCommands, test }} />
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
	dict={{ en: { welcome: { text: "Welcome to $acme$ — type `help` to look around" } } }}
/>
```

`initialCommands` only plays once, on a blank screen: a `clear` does not
replay them. `clear` wipes the screen and does nothing else — bringing
something back after it is yours to write, from `onCommandDone` and
`runRestricted`.

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

| field | |
| --- | --- |
| `name` | the first word of the line |
| `args` | the rest of it, word by word |
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

| `reason` | |
| --- | --- |
| `unknown` | no command of that name in the registry |
| `args` | the command exists, its arguments do not pass |
| `thrown` | its action or its effect threw; the throw itself is in `error` |

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

| field | role |
| --- | --- |
| `action` | the text displayed, already translated |
| `effect` | the side effect; the command reaches your state itself |
| `JSX` | React render under the output, for a command that shows better than it tells |
| `help` | the help; a function when it depends on state, like the one of `lang` |
| `testArgs` | accepted arguments (`authorize`, `empty`); `authorize` accepts a function |
| `display` | animation, styles, custom coloring |
| `restricted` | true when the visitor cannot type it; reserved for code |

## The window

For a shell in a frame, the `window` prop is all it takes. The shell then
provides the container that bounds the movement and scrolls itself through the
frame content, so `scrollRef` has nothing left to say:

```tsx
<Shell
	commands={baseCommands}
	window={{
		title: "flower-shell",
		start: "right-top",
		margin: "24px",
		move: true,
		canExpand: true,
		canClose: true,
		onClose: () => console.log("closed"),
	}}
/>
```

| `window` key | role |
| --- | --- |
| `title` | the text of the title bar |
| `move` | dragged by its bar; `true` by default |
| `start` | the corner it opens in; `center-center` by default |
| `margin` | how far it is held off the edges `start` sent it to; zero by default |
| `compact` | full and not resizable: it takes the whole container, and `start` and `margin` have nothing left to place |
| `canExpand` | the maximise button, and the double-click on the bar |
| `canClose` | the closing cross |
| `open` | open or closed, held by the caller; without it the frame holds its own |
| `onClose` | the cross was clicked |

`start` reads horizontal first, then vertical, out of `left | center | right`
and `top | center | bottom` — `right-top`, `left-bottom`, `center-center`.

`margin` is a CSS length — `"24px"`, `"2rem"`, `"3%"` — and it only pushes
against the edges the frame was sent to: an axis opened on `center` is already
between two edges and stays where it is. Without it, the frame sits flush in
its corner.

The shell only takes the size of what holds it: give that a height, the
package imposes none.

### Opening it from outside

Without `open`, the frame holds its own state: it opens on mount, the cross
closes it, and nothing reopens it. Pass `open` and that state moves out — a
button of yours and the cross now write to the same place, and the cross has
stopped deciding anything: it reports through `onClose` and waits for the prop
to come back false.

```tsx
const [open, setOpen] = useState(false)

;<>
	<button onClick={() => setOpen(current => !current)}>the terminal</button>
	<Shell
		commands={baseCommands}
		initialCommands={["title", "welcome"]}
		window={{ title: "flower-shell", open, onClose: () => setOpen(false) }}
	/>
</>
```

Closed, the terminal is unmounted; the history is not — it lives at module
level. Reopening finds what was written still there, posted at once rather
than typed out again, and `initialCommands` does not play a second time.

### The frame on its own

`Window` is exported on its own, and it knows nothing about the shell: a retro
frame — draggable title bar, maximise, close — around whatever you put inside.
It takes `children`, so it holds a picture, a form, a game just as well.

A shell does not go in it by hand: that is what the `window` prop is for, and
it is the only way the two are meant to meet.

```tsx
import { Window } from "flower-shell"

// container bounds the movement, the ref is the scrollable content
const container = useRef<HTMLDivElement>(null)

;<div ref={container} style={{ position: "relative", height: "100vh" }}>
	<Window show={true} title="a frame" container={container} onClose={onClose}>
		<YourContent />
	</Window>
</div>
```

| `Window` prop | role |
| --- | --- |
| `children` | what the frame holds |
| `show` | mounted or not; the frame never closes itself, `onClose` reports |
| `container` | the frame bounds its movement to this element |
| `title` | the text of the bar |
| `bottomInset` | height reserved at the bottom, for a taskbar |
| `compact` | full and not resizable |
| `move` / `start` / `margin` / `canExpand` / `canClose` | the same five as above |
| `layer` | stacking floor |
| `rank` | rank in the cascade, so as not to open on top of the previous one |
| `onFocus` / `onClose` | the window asks for the front, or closes |

`compact` removes the maximise button and the double-click. The package sets no
threshold: it is up to whoever displays it to decide when — small screen,
reading mode, preference.

## Text markup

Answers go through a coloring pass. Each theme color has its own marker:

| marker | effect |
| --- | --- |
| `§text§` | accent color |
| `+text+` | info color |
| `` `text` `` | command color |
| `!text!` | restricted color |
| `$text$` | brand color |
| `_text_` | the background color: invisible until selected |
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
	fonts: { shell: "monospace", window: "monospace" },
	window: { titleBar: "#ed612e", content: "#f4ebda" },
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
