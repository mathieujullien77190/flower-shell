Pick a theme to start from, move the colors and the logo size, and read the
result twice: once as a shell, once as the code that produces it. The block at
the bottom is the pair to paste: the theme itself, and the `themes` entry plus
the `theme` name that mount it.

The preview is the real thing: a `Shell` wearing the draft, opening on
`title` — the logo `fonts.logo` is written for — then on `test`, the
command that prints every color of the theme.

`fonts.logo` is a CSS length and not a number of pixels: it is written on the
width of the container, `calc(100cqw / 90)` by default, so the logo keeps its
shape whatever the terminal is served in. Divide by less for a bigger one.

It remounts at every touch of a picker: a shell already mounted would not
replay its opening, and the theme lives at module level. Animation is off here
alone, so the palette lands with the color and not a second later.
