/**
 * Jest runs the sources as CommonJS (tsconfig.test.json), the package being
 * ESM: the tests do not go through Vite, and so they do not go through its
 * aliases either — `moduleNameMapper` repeats them, on the same point of
 * truth as `alias.ts` and the `paths` of tsconfig.json.
 */
module.exports = {
	testEnvironment: "jsdom",
	roots: ["<rootDir>/src"],
	testMatch: ["**/*.test.ts", "**/*.test.tsx"],
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	moduleNameMapper: {
		"^@commands/(.*)$": "<rootDir>/src/commands/$1",
		"^@engine/(.*)$": "<rootDir>/src/engine/$1",
		"^@i18n/(.*)$": "<rootDir>/src/i18n/$1",
		"^@render/(.*)$": "<rootDir>/src/render/$1",
		"^@state/(.*)$": "<rootDir>/src/state/$1",
		"^@window/(.*)$": "<rootDir>/src/window/$1",
		"^@theme$": "<rootDir>/src/theme",
		"^@types$": "<rootDir>/src/types",
	},
	transform: {
		"^.+\\.tsx?$": [
			"ts-jest",
			{ tsconfig: "<rootDir>/tsconfig.test.json", useESM: false },
		],
	},
	collectCoverageFrom: [
		"src/**/*.{ts,tsx}",
		"!src/stories/**",
		"!src/**/*.stories.tsx",
	],
	/**
	 * The floor the coverage may not go under, measured on the same `src`
	 * minus the stories. It is a ratchet and not a target: it sits just under
	 * what the suite covers today, so a change that tests less than it
	 * removes fails instead of passing quietly. Raise it when the suite
	 * earns it.
	 *
	 * It stays this low because the tests are on the logic and not on the
	 * rendering: the engine, the store, the instance, i18n, the theme and the
	 * commands are near 100, the React components of `render` and `Shell`
	 * are not covered at all, and they weigh half of `src`.
	 */
	coverageThreshold: {
		global: {
			statements: 55,
			branches: 52,
			functions: 50,
			lines: 55,
		},
	},
}
