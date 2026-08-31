export { Shell } from "./Shell"
export type { ShellHandle, ShellProps, ShellThemes } from "./Shell"

export { baseCommands } from "./commands/base"
export { highlightFlower, plantFlowers } from "./commands/flowers"
export { test } from "./commands/test"
export { title } from "./commands/title"

export type {
	CommandErrorEvent,
	CommandErrorListener,
	CommandErrorReason,
	CommandEvent,
	CommandListener,
} from "./engine/send"
export {
	autocompleteCommand,
	createCommand,
	executeCommand,
	findCommand,
	readHelp,
} from "./engine/terminalEngine"

export { BASE_LANG, browserLang, langs, setDict, t } from "./i18n/lang"
export { dictEn } from "./i18n/en"
export { dictFr } from "./i18n/fr"

export { highlight } from "./render/Command/helpers"

export type { ShellActions, ShellData, ShellState } from "./state/store"

export {
	bareTheme,
	defaultTheme,
	draculaTheme,
	flowerTheme,
	gruvboxTheme,
	monokaiTheme,
	nordTheme,
	parchmentTheme,
	setTheme,
	setThemes,
	wearTheme,
	solarizedTheme,
	theme,
	themeByName,
	themeNames,
	themes,
	twilightTheme,
} from "./theme"
export type {
	ShellColors,
	ShellFonts,
	ShellTheme,
	ShellThemeInput,
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
