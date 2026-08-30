import { RefObject, useCallback, useEffect, useRef, useState } from "react";

import Terminal from "./render/Terminal";
import Window from "./window";
import type { WindowStart } from "./window/types";

import { run, runRestricted, setListeners } from "./engine/send";
import type { CommandErrorListener, CommandListener } from "./engine/send";
import { setDict } from "./i18n/lang";
import { getCommands, setCommands } from "./state/registry";
import {
  shellActions,
  useAnimation,
  useGetCommands,
  useGetCurrentCommand,
  useKeyboardOnFocus,
  useLang,
} from "./state/store";
import { setThemes, ShellThemeInput, wearTheme } from "./theme";
import { BaseCommand, BaseCommands, Dictionaries } from "./types";

/**
 * De quoi poser le shell dans une fenetre sans l'assembler soi-meme. La
 * presence de l'objet suffit : le shell se rend alors dans un `Window`,
 * qui borne son deplacement au conteneur que le shell pose autour de lui.
 *
 * Pour un cadre qui tient autre chose que le shell, ou qui vit dans un
 * bureau a plusieurs fenetres, `Window` s'utilise directement.
 */
export type ShellWindowProps = {
  /** le texte de la barre de titre */
  title?: string;
  /** elle se deplace a la souris par sa barre ; vrai par defaut */
  move?: boolean;
  /** le coin ou elle s'ouvre ; `center-center` par defaut */
  start?: WindowStart;
  /**
   * La distance au bord, en CSS : `"24px"`, `"2rem"`, `"3%"`. Elle ecarte
   * la fenetre du bord dont `start` la rapproche, et ne s'applique donc pas
   * aux axes centres. Zero par defaut.
   */
  margin?: string;
  /**
   * Pleine et non redimensionnable : elle prend tout le conteneur, et
   * `start` comme `margin` n'ont alors plus rien a placer. La marge se
   * pose sur ce qui la tient.
   */
  compact?: boolean;
  /** le bouton d'agrandissement, et le double-clic sur la barre */
  canExpand?: boolean;
  /** la croix de fermeture */
  canClose?: boolean;
  /** appele une fois la fermeture animee, apres que la fenetre a disparu */
  onClose?: () => void;
};

/** un catalogue de themes, indexes par le nom que le visiteur tape */
export type ShellThemes = Record<string, ShellThemeInput>;

export type ShellProps = {
  /**
   * Les commandes connues : celles du paquet, plus les votres. Sans elle,
   * le shell se monte nu — il affiche l'invite et ne repond a rien.
   */
  commands?: BaseCommands & { [name: string]: BaseCommand };
  /**
   * Le theme porte au demarrage ; un theme partiel garde les valeurs qu'il
   * ne donne pas. Sans elle, le shell porte le premier de `themes` — et si
   * `themes` non plus n'est pas donnee, il ne porte rien.
   */
  theme?: ShellThemeInput;
  /**
   * Les themes que le visiteur peut prendre, indexes par le nom qu'il tape.
   * Ce sont exactement ceux que `theme <nom>` accepte et que `help theme`
   * liste — rien de plus.
   *
   * Pour tout le catalogue du paquet d'un coup, `themes={themes}`. Sans
   * elle, le visiteur n'a aucun theme a prendre : `theme <nom>` ne repond
   * plus rien et `help theme` ne liste rien.
   *
   * Chacun se decrit par la clef `theme.<nom>` : a fournir dans votre
   * dictionnaire pour les votres, sans quoi la clef s'affiche telle quelle.
   */
  themes?: ShellThemes;
  /**
   * Vos textes, par langue. Ils recouvrent ceux du paquet clef par clef, et
   * une langue absente du paquet devient utilisable par `lang <code>`.
   */
  dict?: Dictionaries;
  /** langue de depart ; sans elle, le francais */
  lang?: string;
  /**
   * Commandes jouees au demarrage, dans l'ordre du tableau. Chacune part
   * comme tapee ; les restreintes (`title`, `welcome`...) passent par le
   * canal restreint. C'est ici que se met l'ouverture — `["title",
   * "welcome"]` pour le logo puis l'accueil.
   *
   * Jouees une seule fois, sur un ecran vierge : un `clear` ne les rejoue
   * pas, il efface et rien d'autre. Les faire revenir est l'affaire du
   * consommateur — `onCommandDone` le previent du `clear`, `runRestricted`
   * lui permet de rejouer ce qu'il veut.
   */
  initialCommands?: string[];
  /**
   * Pose le shell dans une fenetre. Sans elle, il se rend nu et remplit ce
   * qui le tient.
   *
   * Le shell fournit alors le conteneur qui borne le deplacement et se
   * fait defiler par le contenu du cadre : `scrollRef` n'a plus rien a
   * dire et est ignoree.
   */
  window?: ShellWindowProps;
  /**
   * Element a faire defiler quand la sortie s'allonge : la boite qui tient
   * le shell, quand elle a son propre defilement. Avec `window`, le cadre
   * s'en charge et cette prop est ignoree.
   */
  scrollRef?: RefObject<HTMLElement>;
  /**
   * Avant que la commande ne joue. Le nom et les arguments sont lus sur la
   * ligne envoyee : a ce moment le shell ne sait pas encore s'il connait
   * une commande de ce nom, et ce temoin part donc aussi pour une ligne
   * qu'il refusera ensuite.
   */
  onCommandStart?: CommandListener;
  /**
   * L'action a rendu son texte et l'effet a joue. La commande est faite,
   * mais rien n'est encore a l'ecran : l'ecriture, elle, prend le temps de
   * son animation. Ne part que pour une commande qui a pu jouer.
   */
  onCommandDone?: CommandListener;
  /**
   * La commande a fini de s'ecrire a l'ecran. Part une fois par commande,
   * au passage, et jamais pour une commande qui n'a pas pu jouer.
   */
  onCommandRendered?: CommandListener;
  /**
   * La commande n'a pas joue. `reason` dit pourquoi : `unknown` quand
   * aucune commande ne porte ce nom, `args` quand elle existe mais que ses
   * arguments ne passent pas, `thrown` quand son action ou son effet a
   * leve — et l'erreur est alors dans `error`.
   *
   * Un shell au registre vide n'a rien a redire : il laisse passer ce
   * qu'on lui tape, et ne signale donc aucune erreur.
   */
  onCommandError?: CommandErrorListener;
};

/**
 * Le terminal : la liste des commandes jouees et la ligne de saisie.
 *
 * Le registre, le theme et l'etat vivent au niveau du module — ils servent
 * aussi hors React, une fenetre qui se ferme peut jouer une commande.
 * Corollaire assume : un shell par page.
 */
export const Shell = ({
  commands = {},
  theme,
  themes,
  dict,
  lang,
  initialCommands = [],
  // `window` est aussi le nom de l'objet global : renomme ici pour que le
  // corps du composant garde acces a l'un comme a l'autre
  window: frame,
  scrollRef,
  onCommandStart,
  onCommandDone,
  onCommandRendered,
  onCommandError,
}: ShellProps) => {
  /**
   * Le cadre, quand la prop `window` est donnee. `area` borne le
   * deplacement de la fenetre, `content` est ce qui defile — c'est la ref
   * que `Window` expose, et elle remplace alors `scrollRef`.
   */
  const area = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [framed, setFramed] = useState(true);
  // pose avant le premier rendu : le terminal lit le registre en se rendant
  const [ready] = useState(() => {
    // le dictionnaire d'abord : une commande jouee traduit en s'executant
    setDict(dict);
    setCommands(commands);
    // le catalogue avant le theme de depart : `help theme` et `theme <nom>`
    // lisent le premier, et le second n'a pas a en faire partie
    setThemes(themes);
    wearTheme(theme);
    return true;
  });

  const history = useGetCommands();
  const currentCommand = useGetCurrentCommand();

  const options = {
    lang: useLang(),
    animation: useAnimation(),
    keyboardOnFocus: useKeyboardOnFocus(),
  };

  useEffect(() => {
    setDict(dict);
  }, [dict]);

  useEffect(() => {
    setCommands(commands);
  }, [commands]);

  useEffect(() => {
    setThemes(themes);
    wearTheme(theme);
  }, [themes, theme]);

  useEffect(() => {
    setListeners({
      start: onCommandStart,
      done: onCommandDone,
      error: onCommandError,
    });
  }, [onCommandStart, onCommandDone, onCommandError]);

  // apres le montage, jamais pendant le rendu : la langue du navigateur
  // n'existe pas au prerendu, l'appliquer plus tot ferait diverger le HTML
  useEffect(() => {
    if (lang) shellActions().setLang(lang);
  }, [lang]);

  /**
   * L'ouverture se joue au montage, mais seulement si l'ecran est vide.
   * Le shell peut etre demonte puis remonte — une fenetre qu'on ferme et
   * qu'on rouvre — alors que l'historique, lui, vit au niveau du module
   * et a survecu : la rejouer afficherait le titre deux fois.
   */
  useEffect(() => {
    if (!ready) return;

    const { commands: played, restrictedCommands } = shellActions();
    const onScreen = [...played, ...restrictedCommands].some(
      (command) => command.visible,
    );

    if (!onScreen) {
      // les commandes de depart, enchainees dans l ordre du tableau. une
      // restreinte (title...) passe par le canal restreint, sinon comme tapee
      initialCommands.forEach((pattern) => {
        const name = pattern.split(" ")[0];
        if (getCommands()[name]?.restricted) runRestricted(pattern);
        else run(pattern);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const scrollDown = useCallback(() => {
    // dans un cadre, c'est lui qui defile : sa ref remplace `scrollRef`
    const target = frame ? content.current : scrollRef?.current;
    target?.scrollTo(0, 1000000);
  }, [frame, scrollRef]);

  /**
   * La fin d'ecriture est signalee a chaque rendu tant que la commande est
   * a l'ecran, pas seulement au passage : le temoin ne part donc que sur la
   * bascule, quand la commande n'etait pas encore marquee rendue. Sans ce
   * garde-fou, `onCommandRendered` repartirait a chaque rendu du terminal.
   */
  const handleRendered = useCallback(
    (id: string) => {
      const { commands: played, restrictedCommands } = shellActions();
      const done = [...played, ...restrictedCommands].find(
        (command) => command.id === id,
      );
      const first = !!done && !done.isRendered;

      shellActions().setIsRendered(id);
      scrollDown();

      if (first && done.canExecute) {
        onCommandRendered?.({
          name: done.name,
          args: done.args,
          pattern: done.pattern,
        });
      }
    },
    [scrollDown, onCommandRendered],
  );

  const moveCursor = useCallback((direction: number) => {
    shellActions().moveCursor(direction);
  }, []);

  const terminal = (
    <Terminal
      options={options}
      commands={history}
      currentCommand={currentCommand}
      onSendCommand={run}
      onSendRestrictedCommand={runRestricted}
      onAnimateCommand={scrollDown}
      onSendPreviousCommand={() => moveCursor(-1)}
      onSendNextCommand={() => moveCursor(1)}
      onRendered={handleRendered}
    />
  );

  if (!frame) return terminal;

  /**
   * Le conteneur borne le deplacement de la fenetre, et c'est tout ce que
   * le shell impose : il prend la place qu'on lui donne. A qui l'affiche
   * de poser la hauteur, ici ou sur ce qui le tient.
   */
  return (
    <div ref={area} style={{ position: "relative", height: "100%" }}>
      <Window
        ref={content}
        show={framed}
        container={area}
        title={frame.title}
        move={frame.move}
        start={frame.start}
        margin={frame.margin}
        compact={frame.compact}
        canExpand={frame.canExpand}
        canClose={frame.canClose}
        // la croix anime la fermeture puis previent : la fenetre part d'ici,
        // et le consommateur apprend qu'elle est partie
        onClose={() => {
          setFramed(false);
          frame.onClose?.();
        }}
      >
        {terminal}
      </Window>
    </div>
  );
};
