[Read me in French](./README.fr.md)

# flower-shell

A retro terminal in React: a command engine, history, autocompletion and
animated ASCII rendering.

For the implementation, please refer to the
[Storybook](https://mathieujullien77190.github.io/flower-shell/): everything
is explained there, and you will find many examples of use.

## The component

**Every prop is optional**, and what is left out does not exist rather than
falling back on something. `<Shell />` is valid on its own: it mounts on
nothing — no command, so a typed line is let through without an error; no
theme, so nothing is painted and the shell takes the colors and the font of
the page holding it.

It is worth giving it the two props that make it a terminal all the same: the
commands it answers to, and the themes it can wear. This is the smallest
version worth mounting.

```tsx
import { Shell, baseCommands, themes } from "flower-shell"

const App = () => <Shell commands={baseCommands} themes={themes} />
```

The shell takes the room it is given and nothing more. Give the box that holds
it a height and it scrolls inside it, following its last line as it is
written.

### What it knows

| prop              | type           | default | role                                                                                                                                                                                                                                       |
| ----------------- | -------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `commands`        | `BaseCommands` | `{}`    | The known commands, indexed by the name that invokes them: `baseCommands` plus yours. Exactly these are what the shell answers to, what `help` lists and what [TAB] completes.                                                             |
| `initialCommands` | `string[]`     | `[]`    | Commands played at startup, in the order of the array, each as if typed.                                                                                                                                                                   |
| `dict`            | `Dictionaries` | English | Your texts, by language. They cover the package's key by key, and a language it does not carry becomes reachable through `lang <code>`. They belong to this terminal: two shells side by side speak two languages out of two dictionaries. |
| `lang`            | `string`       | `"en"`  | The language it starts on, a key of `dict`. Applied after mount, never during the render: the language of a browser does not exist at prerender.                                                                                           |
| `themes`          | `ShellThemes`  | none    | The themes the visitor can take, indexed by the name they type. Exactly these are what `theme <name>` accepts and `help theme` lists. `themes={themes}` for the whole catalogue of eight.                                                  |
| `theme`           | `string`       | first   | The one it starts on, a key of `themes`. A name absent from the catalogue is ignored — it cannot open on a theme the visitor has no way of finding again. It belongs to this terminal: switching it paints only itself.                    |
| `animation`       | `boolean`      | `true`  | Letter by letter writing of the answers. A command may say otherwise for itself, through `display.animation`.                                                                                                                              |
| `keyboardOnFocus` | `boolean`      | `true`  | The input takes the focus back wherever on the page the click landed, so one can type without aiming. A click on the terminal itself hands it the keyboard in any case, option or no option.                                               |
| `id`              | `string`       | none    | The name a `<ShellProvider>` above finds this terminal under, so `useShell()` can play a line into it. No id, no commanding; without a provider above, it is ignored.                                                                      |

### What it reports

The four listeners take the same event — `{ name, args, pattern }`, the line
as it was sent — and belong to their own shell: two terminals warn two
consumers.

| prop                | fires                                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `onCommandStart`    | Before the command plays. The shell does not yet know whether it has one by that name, so this fires for a line it will turn down right after.                           |
| `onCommandDone`     | The action returned its text and the effect played. Nothing is on screen yet — the writing takes the time of its animation. Only for a command that could play.          |
| `onCommandRendered` | The answer has finished being written. Once per command, as it happens, never for one that could not play.                                                               |
| `onCommandError`    | The command did not play. `reason` is `unknown` (no command by that name), `args` (it exists, its arguments do not pass) or `thrown` — and the error is then in `error`. |

A shell with no command has nothing to object to: it lets through whatever is
typed and reports no error. As soon as one command exists, an unknown name is
an error again.

## Working on the package

```sh
npm install
npm run storybook      # the documentation, at localhost:6006
```

Before opening a pull request, the five checks the CI runs, from the fastest
to the slowest:

```sh
npm run format:check         # prettier
npm run lint                 # eslint
npm run typecheck            # the sources
npm run typecheck:test       # the tests, on their own tsconfig
npm run test:coverage:check  # the tests, and the coverage floor
npm run build                # what gets published
```

While writing:

```sh
npm test               # one pass
npm run test:watch     # continuously
npm run test:detail    # each test named, one per line
npm run test:coverage  # the coverage, file by file
npm run format         # prettier, writing
npm run lint:fix       # eslint, fixing what it can
```

**The coverage floor is a hundred percent** — lines, statements, branches and
functions — so a line added without a test fails the run. The answer to a red
run is a test, never a lower floor: code no test reaches is code to delete.

The two READMEs say the same thing in two languages and are both maintained.
An edit to one goes into the other, translated, at the same place, in the same
commit.

## Reporting a bug, asking for a feature

Both go through the
[issues](https://github.com/mathieujullien77190/flower-shell/issues). Search
the open ones first — yours may already be there, and adding to it is worth
more than opening a second.

**A bug** is worth reporting when someone else can reproduce it. Give the
version of the package, the version of React, what you did, what you expected
and what happened instead. A minimal `<Shell>` that shows it — the props, the
command you typed — is worth more than a description of it, and a Storybook
link is better still.

**A feature** starts with the need, not with the solution: say what you are
trying to do and what stops you today. Say whether the current API can be bent
into it, and whether the change would break what is already published. What
the package will not do is impose a layout or ship commands for one domain —
`commands` is where those belong.

A pull request is welcome on an issue that has been discussed. Keep it to one
subject, with the tests that hold it up and both READMEs updated if it touches
the public API.
