export { Shell } from "./Shell"
export type { ShellProps, ShellThemes } from "./Shell"
export { ShellProvider, useShell } from "./state/registry"
export type { ShellControls } from "./state/registry"

export { baseCommands } from "./commands/base"
export { highlightFlower } from "./commands/highlight"
export { plantFlowers } from "./commands/common/flowers"
export { testCommand as test } from "./commands/common/test"
export { title } from "./commands/restricted/title"

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
	contrastTheme,
	defaultTheme,
	flowerTheme,
	hibiscusTheme,
	kiwiTheme,
	lavenderTheme,
	mapleTheme,
	nestTheme,
	riceTheme,
	setTheme,
	setThemes,
	wearTheme,
	theme,
	themeByName,
	themeNames,
	themeTone,
	themes,
} from "./theme"
export type {
	ShellColors,
	ShellFonts,
	ShellTheme,
	ShellThemeInput,
	ShellTone,
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
