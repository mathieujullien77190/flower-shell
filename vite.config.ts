import { defineConfig } from "vite"
import { alias } from "./alias.ts"

// Charge automatiquement par Storybook (react-vite) : uniquement les alias,
// aucun reglage de build ici (sinon `build.lib` casserait Storybook).
export default defineConfig({
	resolve: { alias },
})
