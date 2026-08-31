import path from "node:path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { alias } from "./alias.ts"

// Publishing build: bundles `src` resolving the aliases (so the package that
// ships carries no `@...` any more), then emits the `.d.ts`. Peers and
// runtime deps stay external: it is the consumer who installs them.
export default defineConfig({
	resolve: { alias },
	plugins: [dts({ include: ["src"], exclude: ["src/stories/**"] })],
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
				/^zustand($|\/)/,
				"react-device-detect",
				"react-string-replace",
				"uniqid",
			],
		},
	},
})
