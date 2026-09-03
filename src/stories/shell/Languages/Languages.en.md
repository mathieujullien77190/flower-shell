**The languages of the shell are exactly the keys of `dict`** — nothing more.
`lang` picks the one it starts on, among those. Both stories below open on
`help lang`, which lists what each of them mounts and nothing else.

**French** is the easy case: the package ships `dictFr`, you only need to
mount it beside `dictEn`, and `lang fr` and `lang en` both answer.

**German** is the other one, and the pattern for any language the package
does not know. Nothing lives underneath, so `dictDe` has to cover the base
commands itself. And `lang.de` is added to the English dictionary, otherwise
the help would show that bare key once the visitor switched back to English.
