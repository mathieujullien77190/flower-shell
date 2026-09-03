/**
 * The prose of a story, imported as text.
 *
 * `?raw` is Vite's: it hands the file over as a string instead of trying to
 * make a module of it. The docs page renders it through `Markdown`, so what
 * is written there is markdown and nothing else — no template literal to
 * escape, and a `.md` an editor opens as one.
 */
declare module "*.md?raw" {
	const content: string
	export default content
}
