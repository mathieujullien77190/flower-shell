`<Shell />`, with nothing at all. Every prop is optional, and what is left
out simply does not exist. The table below lists them all — it is on this page
alone, since it would say the same thing on every other.

No `commands`, so the registry is empty: nothing answers, and nothing
complains either — a typed line moves on to the next one. And no theme, so
nothing is painted: the shell takes the colors and the font of the page that
holds it, the prompt falls back to `>`, and the markup stops coloring. Pass
`theme`, or a `themes` catalogue to pick the first of, and it dresses up.
