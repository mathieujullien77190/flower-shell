import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Terminal from "./render/Terminal";
import Window from "./window";
import { WindowProps } from "./window/types";

import { run, runRestricted, setListener } from "./engine/send";
import { setDict } from "./i18n/lang";
import { getCommands, setBanner, setCommands, setWelcome } from "./state/registry";
import {
  shellActions,
  useAnimation,
  useGetCommands,
  useGetCurrentCommand,
  useKeyboardOnFocus,
  useLang,
} from "./state/store";
import { setTheme, ShellThemeInput } from "./theme";
import { BaseCommand, BaseCommands, Dictionaries } from "./types";

export type ShellProps = {
  /** les commandes connues : celles du paquet, plus les votres */
  commands: BaseCommands & { [name: string]: BaseCommand };
  /**
   * Commandes restreintes rejouees au demarrage et apres un clear. C'est
   * la que se met la marque : le shell, lui, n'en connait aucune.
   */
  banner?: string[];
  /**
   * Ouvre l'ecran avec le logo ascii du shell. Il passe devant la
   * banniere, et rien ne l'impose : sans ca, le shell demarre nu.
   */
  showTitle?: boolean;
  /**
   * Mot d'accueil affiche sous le logo, au demarrage comme apres un
   * clear. Une clef du dictionnaire, ou le texte lui-meme.
   */
  welcome?: string;
  theme?: ShellThemeInput;
  /**
   * Vos textes, par langue. Ils recouvrent ceux du paquet clef par clef, et
   * une langue absente du paquet devient utilisable par `lang <code>`.
   */
  dict?: Dictionaries;
  /** langue de depart ; sans elle, le francais */
  lang?: string;
  /**
   * Commandes jouees au demarrage, apres la banniere, dans l'ordre du
   * tableau. Chacune part comme tapee ; les restreintes (title, welcome...)
   * sont jouees comme par la banniere. Rejouees une seule fois, ecran vierge.
   */
  initialCommands?: string[];
  /**
   * Element a faire defiler quand la sortie s'allonge. Avec la prop
   * window, il est inutile : le shell fait descendre le contenu du cadre.
   */
  scrollRef?: RefObject<HTMLElement>;
  /** appele a chaque commande jouee, y compris celles du paquet */
  onCommand?: (name: string, args: string[]) => void;
  /**
   * Pose le terminal dans un cadre retro : barre de titre a glisser,
   * agrandissement, fermeture. Sans cette prop, le shell remplit
   * simplement ce qui le contient.
   */
  window?: Omit<WindowProps, "children">;
};

/**
 * Le terminal : la liste des commandes jouees et la ligne de saisie.
 *
 * Le registre, le theme et l'etat vivent au niveau du module — ils servent
 * aussi hors React, une fenetre qui se ferme peut jouer une commande.
 * Corollaire assume : un shell par page.
 */
export const Shell = ({
  commands,
  banner = [],
  showTitle = false,
  welcome,
  theme,
  dict,
  lang,
  initialCommands = [],
  scrollRef,
  onCommand,
  window: windowProps,
}: ShellProps) => {
  // le logo et l'accueil sont des commandes de base : les afficher, c'est
  // les mettre en tete de la banniere
  const opening = useMemo(() => {
    const head = [
      ...(showTitle ? ["title"] : []),
      ...(welcome ? ["welcome"] : []),
    ];

    return [...head.filter((name) => !banner.includes(name)), ...banner];
  }, [showTitle, welcome, banner]);

  // pose avant le premier rendu : le terminal lit le registre en se rendant
  const [ready] = useState(() => {
    // le dictionnaire d'abord : une commande jouee traduit en s'executant
    setDict(dict);
    setCommands(commands);
    setBanner(opening);
    setWelcome(welcome || "");
    setTheme(theme);
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
    setBanner(opening);
  }, [opening]);

  useEffect(() => {
    setWelcome(welcome || "");
  }, [welcome]);

  useEffect(() => {
    setListener(onCommand);
  }, [onCommand]);

  // apres le montage, jamais pendant le rendu : la langue du navigateur
  // n'existe pas au prerendu, l'appliquer plus tot ferait diverger le HTML
  useEffect(() => {
    if (lang) shellActions().setLang(lang);
  }, [lang]);

  /**
   * La banniere s'ecrit au montage, mais seulement si l'ecran est vide.
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
      opening.forEach((name) => runRestricted(name));
      // apres la banniere : les commandes de depart, enchainees dans l'ordre.
      // une restreinte (title...) passe par le canal restreint, sinon comme tapee
      initialCommands.forEach((pattern) => {
        const name = pattern.split(" ")[0];
        if (getCommands()[name]?.restricted) runRestricted(pattern);
        else run(pattern);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // le contenu du cadre, quand c'est lui qui defile
  const framedRef = useRef<HTMLDivElement>(null);

  const scrollDown = useCallback(() => {
    const target = scrollRef?.current || framedRef.current;
    target?.scrollTo(0, 1000000);
  }, [scrollRef]);

  const handleRendered = useCallback(
    (id: string) => {
      shellActions().setIsRendered(id);
      scrollDown();
    },
    [scrollDown],
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

  if (!windowProps) return terminal;

  return (
    <Window {...windowProps} ref={framedRef}>
      {terminal}
    </Window>
  );
};
