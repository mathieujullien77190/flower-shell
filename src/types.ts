import { CSSProperties } from "react"

/** a nested dictionary of texts: `t("help.desc")` reads the path in it */
export type Dict = { [key: string]: string | Dict }

/** the dictionaries of the shell, one per language */
export type Dictionaries = Record<string, Dict>

/**
 * A static text: a key of the dictionary, or the text itself. The shell puts
 * it through `t()` when it comes to use it, and an unknown key shows up as
 * it is — hence the two uses under a single type.
 */
export type Text = string

export type Help = {
	description?: Text
	patterns: { pattern: string; description: Text }[]
}

/**
 * The help of a command, or what it takes to produce it. The function is
 * read at display time: that is what lets `lang` announce the languages
 * actually mounted, which the consumer sets long afterwards.
 */
export type HelpInput = Help | (() => Help)

export type Action = ({
	name,
	args,
	help,
	commands,
}: {
	name: Command["name"]
	args: Command["args"]
	help?: Help
	commands: BaseCommands
}) => string

/**
 * The accepted arguments. `authorize` can be a function: the `lang` command
 * has to read the languages of the dictionary, which the consumer sets long
 * after the commands have been defined.
 */
export type Args = {
	authorize: string[] | (() => string[])
	empty: boolean
}

export type BaseCommand = {
	restricted: boolean
	action: Action
	/** side effect of the command: it attacks the store itself */
	effect?: ({ args }: { args: Command["args"] }) => void
	JSX?: ({ args }: { args: Command["args"] }) => import("react").JSX.Element
	help?: HelpInput
	testArgs?: Args
	display?: {
		hideCmd?: boolean
		style?: CSSProperties
		stylePre?: CSSProperties
		/** colored rendering of the result; an untouched string is a valid one */
		highlight?: (txt: string) => import("react").ReactNode
		reverse?: boolean
		stepTime?: number
		stepSize?: number
		animation?: boolean
	}
}

/**
 * The known commands, indexed by the name that invokes them. The ones of the
 * package are named: the editor suggests them, and a misspelled key shows.
 * All of them are optional — a shell may keep none — and the index signature
 * takes yours.
 */
export type BaseCommands = {
	help?: BaseCommand
	clear?: BaseCommand
	hello?: BaseCommand
	flowers?: BaseCommand
	animation?: BaseCommand
	font?: BaseCommand
	theme?: BaseCommand
	lang?: BaseCommand
	/**
	 * the workbench of the markup: one command, the whole rendering. It does
	 * not ship with `baseCommands`, it is mounted by hand
	 */
	test?: BaseCommand
	/** the greeting and the logo: restricted, played by the banner */
	welcome?: BaseCommand
	title?: BaseCommand
	/** restricted too, looked up by name when the input does not pass */
	unknow?: BaseCommand
	argumenterror?: BaseCommand
	/** restricted: the switchboard of the clickable markers `#label ~ cmd#` */
	actionmap?: BaseCommand
	[name: string]: BaseCommand | undefined
}

export type Command = {
	pattern: string
	name: string
	args: string[]
	/** the text on screen, already translated: `t()` played at execution */
	result: string
	restricted: boolean
	visible?: boolean
	timestamp?: number
	/**
	 * The rank of arrival in the session, strictly increasing. It is what
	 * orders the display, and not `timestamp`: two commands played one after
	 * the other in the same loop land on the same millisecond.
	 */
	order?: number
	id: string
	canExecute: boolean
	isRendered: boolean
}
