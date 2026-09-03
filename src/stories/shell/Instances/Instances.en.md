Two shells on the same page, and nothing shared between them: two histories,
two cursors, two languages. Type in one and the other does not move; the left
one answers in English, the right one in French, out of the same `dict`.

**No id, no commanding.** A terminal is only reachable if it was named, which
is what `id` is for, and `<ShellProvider>` is where those names are looked
up. The toolbar above takes `useShell()` and aims: `run("left", "hello")`,
`runRestricted("left", "title")`, `actions("right")` for that shell's state.
A shell with no `id`, or with no provider above, simply cannot be reached —
and does not need to be.

**The theme is the exception.** It lives in a module, because the markup is
coloured by a function and not by a component, so a context could not reach
it: `theme lavender` typed in one terminal repaints both. The language, the
history and the options are per shell; the palette is not.
