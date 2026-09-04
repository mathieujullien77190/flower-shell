import path from "node:path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { alias } from "./alias.ts"

// Publishing build: bundles `src` resolving the aliases (so the package that
// ships carries no `@...` any more), then emits the `.d.ts`. Peers and
// runtime deps stay external: it is the consumer who installs them.
export default defineConfig({
	resolve: { alias },
	// the stories and the tests are not part of what is published: without
	// this the tests each shipped an empty `.d.ts` beside the real ones
	plugins: [
		dts({
			include: ["src"],
			exclude: ["src/stories/**", "src/**/*.test.ts", "src/**/*.test.tsx"],
		}),
	],
	build: {
		lib: {
			entry: path.resolve(process.cwd(), "src/index.ts"),
			formats: ["es", "cjs"],
			fileName: format => `index.${format === "es" ? "mjs" : "cjs"}`,
		},
		sourcemap: true,
		rollupOptions: {
			external: [
				/^react($|\/)/,
				/^react-dom($|\/)/,
				"styled-components",
				"react-device-detect",
				"react-string-replace",
				"uniqid",
				// the sub-paths too: the store comes from `zustand/vanilla`
				/^zustand($|\/)/,
			],
		},
	},
})
