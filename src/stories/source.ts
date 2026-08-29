/**
 * The code shown under a story on its docs page.
 *
 * Without it, Storybook shows either the story as written in the file
 * (args, no imports) or the JSX rebuilt from those args — where `commands`
 * unfolds into several thousand characters. What we want to give away is
 * what a consumer would actually write.
 *
 * It goes on the story, never on the meta: the CSF plugin appends its own
 * `parameters` key to a meta that carries a doc comment, and the duplicate
 * key wins. On a story the same injection is a spread, so this survives.
 */
export const source = (code: string) => ({
	docs: { source: { code: code.trim(), language: "tsx" } },
})

/**
 * No code at all under the story: the render is the whole point, and the
 * lines that produced it are already spelled out on the left of each row.
 */
export const renderOnly = {
	docs: { canvas: { sourceState: "none" } },
}
