/**
 * The code of a fenced block, the fence taken off. The snippet is written
 * between three backticks so the file reads as markdown — an editor colors
 * it — and nothing in it has to be escaped, where a template literal in the
 * story needed every backtick and every `${` guarded.
 */
const fenced = (text: string) => {
	const match = text.match(/^```[a-z]*\n([\s\S]*?)\n```/)

	return (match ? match[1] : text).trim()
}

/**
 * The code shown under a story on its docs page.
 *
 * Without it, Storybook shows either the story as written in the file
 * (args, no imports) or the JSX rebuilt from those args — where `commands`
 * unfolds into several thousand characters. What we want to give away is
 * what a consumer would actually write.
 *
 * The snippet lives in `<Story>.source.md`, beside the story: what one
 * would write at home, in a file one can read as such.
 *
 * It goes on the story, never on the meta: the CSF plugin appends its own
 * `parameters` key to a meta that carries a doc comment, and the duplicate
 * key wins. On a story the same injection is a spread, so this survives.
 */
export const source = (code: string) => ({
	docs: { source: { code: fenced(code), language: "tsx" } },
})

/**
 * No code at all under the story: the render is the whole point, and the
 * lines that produced it are already spelled out on the left of each row.
 *
 * These stories also render inline, against the global `inline: false`. A
 * shell bounds itself on the window height and needs a frame of its own to
 * be bounded by; a plain render does not, and inside a fixed-height frame it
 * cannot even scroll — the canvas freeze in `preview-head` applies there
 * too. Inline, it takes the height it needs and the docs page scrolls.
 *
 * And they take the padded layout, against the global `fullscreen`: a shell
 * is meant to fill what holds it, a panel of samples is not, and inline it
 * would otherwise sit flush against the edge of the docs canvas.
 */
export const renderOnly = {
	layout: "padded",
	docs: {
		canvas: { sourceState: "none" },
		story: { inline: true },
	},
}
