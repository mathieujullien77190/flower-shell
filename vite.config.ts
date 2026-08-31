import { defineConfig } from "vite"
import { alias } from "./alias.ts"

// Loaded automatically by Storybook (react-vite): the aliases only, no build
// setting here (or `build.lib` would break Storybook).
export default defineConfig({
	resolve: { alias },
})
