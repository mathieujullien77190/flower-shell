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
			// the package does not talk in the consumer's console; the stories,
			// on the other hand, use it to show the events
			"no-console": "warn",
			"@typescript-eslint/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
		},
	},
	{
		// the config of Jest is read by Node, in CommonJS
		files: ["jest.config.cjs"],
		languageOptions: { globals: globals.node, sourceType: "commonjs" },
	},
	{
		// the tests: `describe`, `it` and `jest` are given by the runner
		files: ["**/*.test.{ts,tsx}", "jest.setup.ts"],
		languageOptions: { globals: globals.jest },
	},
	prettier
)
