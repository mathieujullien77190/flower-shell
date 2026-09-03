Everything the shell hands back, and nothing else: the panel on the right is
written from the four event props alone, one row per command with a tick under
each moment it has reached.

**Open the browser console.** Every event is logged there in full, which is
where you see what the panel cannot show: each one carries the name, the
arguments, and `pattern` — the whole line as it was sent.

`onCommandStart` fires before anything runs, off that line — so it fires for
a command that does not exist too, which the others never do.
`onCommandDone` fires once the action has returned its text and the effect
has played: the command is over, but nothing is on screen yet.
`onCommandRendered` fires when the text has finished being written, which on
a long output is a good while later.

`onCommandError` fires instead of `onCommandDone` when the command did not
play, and says why through `reason`. Three lines to try, one for each: `nope`
is `unknown`, `theme nope` is `args` — the command exists, the argument does
not — and `boom` throws on purpose, which is `thrown` and carries the error
itself.
