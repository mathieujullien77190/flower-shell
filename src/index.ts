export { Shell } from "./Shell"
export type { ShellProps } from "./Shell"

export { baseCommands } from "./commands/base"
export { highlightFlower, plantFlowers } from "./commands/flowers"
export { test } from "./commands/test"
export { title } from "./commands/title"

export { run, runRestricted } from "./engine/send"
export {
	autocompleteCommand,
	createCommand,
	executeCommand,
	findCommand,
	readHelp,
} from "./engine/terminalEngine"

export {
	BASE_LANG,
	browserLang,
	langs,
	setDict,
	t,
} from "./i18n/lang"
export { dictEn } from "./i18n/en"
export { dictFr } from "./i18n/fr"

export { highlight } from "./render/Command/helpers"

export {
	shellActions,
	useAnimation,
	useGetCommands,
	useGetCurrentCommand,
	useGetCursor,
	useGetLastCommand,
	useGetStart,
	useKeyboardOnFocus,
	useLang,
	useShellStore,
} from "./state/store"

export { default as Window } from "./window"
export type { Mode, Pos, WindowProps } from "./window/types"
export {
	ANIM_TIME,
	CASCADE,
	MEDIUM_MARGIN,
	MEDIUM_SIZE,
	TOP_LAYER,
} from "./window/constants"

export {
	defaultTheme,
	draculaTheme,
	flowerTheme,
	gruvboxTheme,
	monokaiTheme,
	nordTheme,
	parchmentTheme,
	setTheme,
	solarizedTheme,
	theme,
	themeNames,
	themes,
	twilightTheme,
} from "./theme"
export type {
	ShellColors,
	ShellFonts,
	ShellTheme,
	ShellThemeInput,
	WindowColors,
} from "./theme"

export type {
	Action,
	Args,
	BaseCommand,
	BaseCommands,
	Command,
	Dict,
	Dictionaries,
	Help,
	HelpInput,
	Text,
} from "./types"
