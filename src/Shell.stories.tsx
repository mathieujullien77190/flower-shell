import { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Shell } from "./Shell";
import { baseCommands } from "./commands/base";
import { shellActions } from "./state/store";
import { t } from "./i18n/lang";
import { dictEn } from "./i18n/en";
import { dictEs } from "./i18n/es";
import { dictFr } from "./i18n/fr";
import { BaseCommand, Dict } from "./types";

/**
 * L'etat du shell vit dans un module : sans ca, l'historique d'une story
 * suivrait dans la suivante. Le vidage se fait pendant le rendu du
 * decorateur, donc avant que le shell ne monte et ne joue sa banniere.
 */
const Fresh = ({ children }: { children: React.ReactNode }) => {
  useState(() => {
    shellActions().reset();
    return true;
  });

  return children;
};

/**
 * La boite qui accueille le shell : plus petite que la page, bordee, et
 * surtout defilante. Sa ref part en scrollRef, ce qui permet au shell de
 * la faire descendre quand la sortie s'allonge — sans elle, tout ce qui
 * depasse resterait hors d'atteinte.
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

/** Le terminal seul, remis a neuf a chaque story par le decorateur Fresh. */
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
 * Les commandes livrees avec le paquet, rien de plus : sans prop `dict`, le
 * shell ne parle que l'anglais.
 */
export const Default: Story = {
  args: {
    commands: baseCommands,
  },
};

/**
 * Un objet vide tient debout : le moteur cherche ses commandes d'erreur
 * par leur nom, et se rabat sur le dictionnaire du paquet quand elles
 * manquent. Rien ne repond, mais rien ne casse.
 */
export const NoCommands: Story = {
  args: {
    commands: {},
  },
};

/**
 * L'ouverture : le logo du paquet, puis le mot d'accueil du consommateur.
 * Le `welcome` est une clef du dictionnaire, resolue quand la commande joue.
 */
export const WithOpening: Story = {
  args: {
    commands: baseCommands,
    showTitle: true,
    welcome: "app.welcome",
    // une clef ajoutee a l'anglais du paquet : le reste des textes tient
    dict: {
      en: { app: { welcome: "Type `help` to list the commands" } },
    },
  },
};

/**
 * Une commande maison : le texte traduit passe par `t()`, le reste s'ecrit
 * en clair. Sa description d'aide est une clef, lue a l'affichage du `help`.
 */
const ping: BaseCommand = {
  restricted: false,
  action: ({ args }) =>
    args.length === 0 ? t("ping.pong") : `pong ${args.join(" ")}`,
  help: {
    patterns: [{ pattern: "ping [texte]", description: "ping.usage" }],
  },
};

/** une commande maison s'ajoute a l'objet, le reste ne bouge pas */
export const CustomCommands: Story = {
  args: {
    commands: { ...baseCommands, ping },
    dict: {
      en: { ping: { pong: "pong!", usage: "answers pong" } },
    },
  },
};

/**
 * Le francais et l'espagnol : le paquet les livre, il suffit de les monter.
 * Les langues du shell sont les clefs de `dict` — ici les trois, donc
 * `lang fr`, `lang es` et `lang en` repondent toutes.
 */
export const InFrenchAndSpanish: Story = {
  args: {
    commands: baseCommands,
    lang: "fr",
    dict: { en: dictEn, fr: dictFr, es: dictEs },
  },
};

/**
 * Une langue que le paquet ne connait pas : rien ne vit dessous, le
 * dictionnaire doit donc couvrir les commandes de base lui-meme. C'est le
 * modele a suivre pour n'importe quelle autre langue.
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
      // l'anglais du paquet ne connait pas l'allemand : `lang.de` s'ajoute ici,
      // sinon l'aide de `lang` sort la clef nue une fois passe en anglais
      en: { lang: { de: "Shows every text in German" } },
      de: dictDe,
    },
  },
};

/** couleurs et invite : tout se remplace, le reste garde ses defauts */
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

/**
 * Le meme shell, pose dans son cadre : barre de titre a glisser, bouton
 * d'agrandissement, croix. Le conteneur borne le deplacement.
 */
const Framed = () => {
  const container = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={container}
      style={{ position: "relative", height: "100%", background: "#84787A" }}
    >
      <Shell
        commands={baseCommands}
        showTitle
        window={{ show: true, title: "flower-shell", container }}
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
