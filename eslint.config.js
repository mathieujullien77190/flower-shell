import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import storybook from "eslint-plugin-storybook"
import prettier from "eslint-config-prettier"
import tseslint from "typescript-eslint"

export default tseslint.config(
	{ ignores: ["dist", "storybook-static", "node_modules"] },
	js.configs.recommended,
	...tseslint.configs.recommended,
	...storybook.configs["flat/recommended"],
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2022,
			globals: globals.browser,
		},
		plugins: { "react-hooks": reactHooks },
		rules: {
			...reactHooks.configs.recommended.rules,
			// le paquet ne parle pas dans la console du consommateur ; les
			// stories, elles, s'en servent pour montrer les evenements
			"no-console": "warn",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
		},
	},
	prettier
)
