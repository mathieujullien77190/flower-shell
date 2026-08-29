import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Shell } from "./Shell";
import { baseCommands } from "./commands/base";
import { defaultTheme, lightTheme, setTheme } from "./theme";
import { shellActions } from "./state/store";
import { run } from "./engine/send";
import { t } from "./i18n/lang";
import { dictEn } from "./i18n/en";
import { dictEs } from "./i18n/es";
import { dictFr } from "./i18n/fr";
import { BaseCommand, Dict } from "./types";

/**
 * The shell state lives in a module: without this, one story's history would
 * carry into the next. The reset happens while the decorator renders, so
 * before the shell mounts and plays its banner.
 */
const Fresh = ({ children }: { children: React.ReactNode }) => {
  useState(() => {
    shellActions().reset();
    // the theme lives at module level: without a reset it would leak from
    // one story to the next. The shell replays its own right after, on mount.
    setTheme(defaultTheme);
    return true;
  });

  return children;
};

/**
 * The box that holds the shell: smaller than the page, bordered, and above
 * all scrollable. Its ref goes to scrollRef, which lets the shell scroll it
 * down as the output grows — without it, anything overflowing would stay out
 * of reach.
 */
const Boxed = ({
  children,
}: {
  children: (box: React.RefObject<HTMLDivElement>) => React.ReactNode;
}) => {
  const box = useRef<HTMLDivElement>(null);

  return (
    <Fresh>
      <div style={{ height: "100vh", boxSizing: "border-box", padding: 32 }}>
        <div
          ref={box}
          style={{
            height: "100%",
            overflowY: "auto",
            border: "solid 2px #000000",
            borderRadius: 4,
            boxShadow: "3px 2px 4px #00000041",
          }}
        >
          {children(box)}
        </div>
      </div>
    </Fresh>
  );
};

/** The terminal on its own, reset for each story by the Fresh decorator. */
const meta: Meta<typeof Shell> = {
  title: "Shell",
  component: Shell,
  decorators: [
    (Story, context) => (
      <Boxed>
        {(box) => <Story args={{ ...context.args, scrollRef: box }} />}
      </Boxed>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Shell>;

/**
 * The commands shipped with the package, nothing more: without a `dict` prop,
 * the shell only speaks English.
 */
export const Default: Story = {
  args: {
    commands: baseCommands,
  },
};

/**
 * An empty object stands on its own: the engine looks up its error commands
 * by name, and falls back to the package dictionary when they are missing.
 * Nothing answers, but nothing breaks.
 */
export const NoCommands: Story = {
  args: {
    commands: {},
  },
};

/**
 * The opening: the package logo, then the consumer's welcome message. The
 * `welcome` is a dictionary key, resolved when the command plays.
 */
export const WithOpening: Story = {
  args: {
    commands: baseCommands,
    showTitle: true,
    welcome: "app.welcome",
    // a key added to the package English: the rest of the texts still hold
    dict: {
      en: { app: { welcome: "Type `help` to list the commands" } },
    },
  },
};

/**
 * A custom command: the translated text goes through `t()`, the rest is
 * written plainly. Its help description is a key, read when `help` is shown.
 */
const ping: BaseCommand = {
  restricted: false,
  action: ({ args }) =>
    args.length === 0 ? t("ping.pong") : `pong ${args.join(" ")}`,
  help: {
    patterns: [{ pattern: "ping [text]", description: "ping.usage" }],
  },
};

/** a custom command is added to the object, the rest stays put */
export const CustomCommands: Story = {
  args: {
    commands: { ...baseCommands, ping },
    dict: {
      en: { ping: { pong: "pong!", usage: "answers pong" } },
    },
  },
};

/**
 * French and Spanish: the package ships them, you only need to mount them.
 * The shell's languages are the keys of `dict` — here all three, so
 * `lang fr`, `lang es` and `lang en` all respond.
 */
export const InFrenchAndSpanish: Story = {
  args: {
    commands: baseCommands,
    lang: "fr",
    dict: { en: dictEn, fr: dictFr, es: dictEs },
  },
};

/**
 * A language the package does not know: nothing lives underneath, so the
 * dictionary must cover the base commands itself. This is the pattern to
 * follow for any other language.
 */
const dictDe: Dict = {
  common: {
    restricted: "Dies ist ein gesperrter Befehl, du kannst ihn nicht benutzen",
  },
  help: {
    desc: "Zeigt Hilfe zu den Befehlen",
    usage: "zeigt Hilfe zu [command]",
    notFound: "Dieser Befehl existiert nicht",
  },
  clear: { usage: "Löscht alles außer dem Verlauf" },
  hello: {
    usage: "Zeigt `Hello world`",
    usageArgs: "Zeigt `Hello [text]`",
    world: "Hallo Welt",
  },
  flowers: { usage: "🌼🌼🌼 Pflanze Blumen 🌼🌼🌼" },
  animation: {
    on: "Schaltet die Animationen ein",
    off: "Schaltet die Animationen aus",
    enabled: "eingeschaltet",
    disabled: "ausgeschaltet",
  },
  theme: {
    light: "Wechselt zum hellen Thema",
    dark: "Wechselt zum dunklen Thema",
    set: "Thema: {mode}",
  },
  lang: {
    de: "Zeigt alle Texte auf Deutsch",
    en: "Zeigt alle Texte auf Englisch",
    set: "Sprache: {lang}",
  },
  error: {
    unknown:
      "{name} ist kein interner Befehl, tippe `help` für die Liste der Befehle",
    args: "Argument(e) nicht erkannt",
  },
};

export const InGerman: Story = {
  args: {
    commands: baseCommands,
    lang: "de",
    dict: {
      // the package English does not know German: `lang.de` is added here,
      // otherwise the `lang` help shows the bare key once switched to English
      en: { lang: { de: "Shows every text in German" } },
      de: dictDe,
    },
  },
};

/** colours and prompt: everything can be replaced, the rest keeps its defaults */
export const CustomTheme: Story = {
  args: {
    commands: baseCommands,
    theme: {
      colors: {
        background: "#1b1b2f",
        textColor: "#e6e6e6",
        importantColor: "#e94560",
        cmdColor: "#53d8fb",
        restrictedColor: "#f0a500",
        infoColor: "#9d8df1",
        appColor: "#53d8fb",
      },
      prompt: "λ",
    },
  },
};

/** the light theme shipped with the package: parchment background, darkened colours */
export const LightTheme: Story = {
  args: {
    commands: baseCommands,
    theme: lightTheme,
  },
};

/**
 * A clickable link in the output that runs a command. The `#label ~ cmd args#`
 * marker shows `label` and, on click, dispatches `actionmap cmd args`. So a
 * custom `actionmap` command routes the click by running that command line.
 */
const menu: BaseCommand = {
  restricted: true,
  action: () => "Try it → #click to say hello ~ hello#",
  display: { hideCmd: true },
};

/** the router: a click sends `actionmap <cmd>`, its effect runs `<cmd>` */
const actionmap: BaseCommand = {
  restricted: true,
  action: () => "",
  effect: ({ args = [] }) => run(args.join(" ")),
  display: { hideCmd: true },
};

export const ClickableCommand: Story = {
  args: {
    commands: { ...baseCommands, menu, actionmap },
    // the banner plays `menu` at startup, so the link shows right away
    banner: ["menu"],
  },
};

/**
 * The same shell, placed in its frame: a draggable title bar, a maximise
 * button, a close cross. The container bounds the movement.
 *
 * It also carries an `exit` command that closes the window, and chains
 * `title` then `help exit` at startup through the `initialCommands` prop.
 */

// the window `show` is React state in Framed; the command reaches it through
// this module handle, set on each render
let closeWindow = () => {};

const exit: BaseCommand = {
  restricted: false,
  action: () => "bye 🌼",
  effect: () => closeWindow(),
  help: {
    patterns: [{ pattern: "exit", description: "closes the window" }],
  },
};

const Framed = () => {
  const container = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(true);
  closeWindow = () => setShow(false);

  return (
    <div
      ref={container}
      style={{ position: "relative", height: "100%", background: "#84787A" }}
    >
      {/* dock icon: toggles the window, lit when open, dimmed when closed */}
      <div
        onClick={() => setShow((open) => !open)}
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

      <Shell
        commands={{ ...baseCommands, exit }}
        initialCommands={["title", "help exit"]}
        window={{
          show,
          title: "flower-shell",
          container,
          onClose: () => setShow(false),
        }}
      />
    </div>
  );
};

export const InWindow: Story = {
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <Fresh>
        <Story />
      </Fresh>
    ),
  ],
  render: () => <Framed />,
};
