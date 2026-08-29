import path from "node:path"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"
import { alias } from "./alias.ts"

// Build de publication : bundle `src` en resolvant les alias (le paquet livre
// n'a donc plus aucun `@...`), puis emet les `.d.ts`. peers et deps runtime
// restent externes : c'est le consommateur qui les installe.
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
