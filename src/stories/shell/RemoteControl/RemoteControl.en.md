One terminal, and a panel that drives it from outside. The panel is not in the
shell and knows nothing about it: it sits under the same `<ShellProvider>`,
takes `useShell()`, and names the terminal it aims at.

`run` sends a line as if it had been typed — try `nope`, which the shell
turns down like any other bad line. `runRestricted` sends what the visitor
cannot: `title` and `welcome` are the opening, replayable at will. And
`actions(id)` is the state itself, setters included — `clear`, `reset`,
`setLang`, `setAnimation`.

**The panel does not follow the terminal.** `actions(id)` reads fresh when it
is called, but nothing here subscribes to anything: the read-out shows what
the state was when you pressed _read_, not what it is now. Type a line in the
terminal and press _read_ again to see it move. A panel that had to stay in
step would keep its own copy, or live inside the shell rather than beside it.
