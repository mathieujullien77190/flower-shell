import { useRef, useState } from "react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import { Shell } from "../../Shell"
import Window from "../../window"
import { baseCommands } from "../../commands/base"
import { BaseCommand } from "../../types"
import { fresh } from "../decorators"
import { source } from "../source"

/**
 * `Window` is a component of its own, and it knows nothing about the shell:
 * a draggable title bar, a maximise button, a close cross, around whatever
 * you put inside it. Here it holds a `Shell` — it would hold anything else
 * just as well.
 *
 * Its ref is the scrollable content, which is what `scrollRef` wants: the
 * shell then scrolls the frame as its output grows. The `exit` command
 * closes the window, and `title` then `help exit` are chained at startup
 * through `initialCommands`.
 */

// the window `show` is React state in Framed; the command reaches it through
// this module handle, set on each render
let closeWindow = () => {}

const exit: BaseCommand = {
	restricted: false,
	action: () => "bye 🌼",
	effect: () => closeWindow(),
	help: {
		patterns: [{ pattern: "exit", description: "closes the window" }],
	},
}

const Framed = () => {
	const container = useRef<HTMLDivElement>(null)
	const content = useRef<HTMLDivElement>(null)
	const [show, setShow] = useState(true)
	closeWindow = () => setShow(false)

	return (
		<div
			ref={container}
			style={{ position: "relative", height: "100%", background: "#84787A" }}
		>
			{/* dock icon: toggles the window, lit when open, dimmed when closed */}
			<div
				onClick={() => setShow(open => !open)}
				title={show ? "close window" : "open window"}
				style={{
					position: "absolute",
					top: 12,
					left: 12,
					zIndex: 20,
					cursor: "pointer",
					userSelect: "none",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: 4,
					padding: "8px 12px",
					borderRadius: 8,
					background: show ? "rgba(255,255,255,0.18)" : "transparent",
					boxShadow: show ? "0 0 0 1px rgba(255,255,255,0.55)" : "none",
					opacity: show ? 1 : 0.4,
					filter: show ? "none" : "grayscale(1)",
					transition: "all 150ms ease",
				}}
			>
				<span style={{ fontSize: 30, lineHeight: 1 }}>🌼</span>
				<span style={{ fontSize: 12, fontWeight: "bold", color: "#fff" }}>
					flower Shell
				</span>
			</div>

			<Window
				ref={content}
				show={show}
				title="flower-shell"
				container={container}
				onClose={() => setShow(false)}
			>
				<Shell
					commands={{ ...baseCommands, exit }}
					initialCommands={["title", "help exit"]}
					scrollRef={content}
				/>
			</Window>
		</div>
	)
}

const meta: Meta<typeof Shell> = {
	title: "Shell/In a window",
	component: Shell,
	decorators: [fresh],
}

export default meta

export const InWindow: StoryObj<typeof Shell> = {
	name: "In a window",
	parameters: {
		layout: "fullscreen",
		...source(`
import { useRef, useState } from "react"
import { Shell, Window, baseCommands } from "flower-shell"
import type { BaseCommand } from "flower-shell"

// show is React state in Framed; the command reaches it through this
// module handle, set on each render
let closeWindow = () => {}

const exit: BaseCommand = {
	restricted: false,
	action: () => "bye 🌼",
	effect: () => closeWindow(),
	help: {
		patterns: [{ pattern: "exit", description: "closes the window" }],
	},
}

const Framed = () => {
	// container bounds the window's movement, content is what scrolls
	const container = useRef<HTMLDivElement>(null)
	const content = useRef<HTMLDivElement>(null)
	const [show, setShow] = useState(true)
	closeWindow = () => setShow(false)

	return (
		<div ref={container} style={{ position: "relative", height: "100%" }}>
			<Window
				ref={content}
				show={show}
				title="flower-shell"
				container={container}
				onClose={() => setShow(false)}
			>
				<Shell
					commands={{ ...baseCommands, exit }}
					initialCommands={["title", "help exit"]}
					scrollRef={content}
				/>
			</Window>
		</div>
	)
}
`),
	},
	render: () => <Framed />,
}
