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
		"!src/**/*.d.ts",
		"!src/**/*.d.ts",
		"!src/**/*.stories.tsx",
	],
	/**
	 * The floor the coverage may not go under, measured on the same `src`
	 * minus the stories. It is at a hundred on the four counts: every line,
	 * every branch and every function of what is published is played by a
	 * test, and code that nothing reaches is code to delete rather than to
	 * excuse.
	 *
	 * So a line added without a test fails the run. That is the point, and
	 * the answer is a test — never a lower number here.
	 */
	coverageThreshold: {
		global: {
			statements: 100,
			branches: 100,
			functions: 100,
			lines: 100,
		},
	},
}
