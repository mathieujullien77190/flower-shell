import { RefObject, useCallback, useEffect, useState } from "react";

import Terminal from "./render/Terminal";

import { run, runRestricted, setListener } from "./engine/send";
import { setDict } from "./i18n/lang";
import { getCommands, setBanner, setCommands } from "./state/registry";
import {
  shellActions,
  useAnimation,
  useGetCommands,
  useGetCurrentCommand,
  useKeyboardOnFocus,
  useLang,
} from "./state/store";
import { setTheme, setThemes, ShellThemeInput } from "./theme";
import { BaseCommand, BaseCommands, Dictionaries } from "./types";

export type ShellProps = {
  /**
   * Les commandes connues : celles du paquet, plus les votres. Sans elle,
   * le shell se monte nu — il affiche l'invite et ne repond a rien.
   */
  commands?: BaseCommands & { [name: string]: BaseCommand };
  /**
   * Commandes restreintes rejouees au demarrage et apres un clear. C'est
   * la que se met la marque : le shell, lui, n'en connait aucune.
   */
  banner?: string[];
  /** le theme de depart ; un theme partiel garde les valeurs qu'il ne donne pas */
  theme?: ShellThemeInput;
  /**
   * Les themes que le visiteur peut prendre, indexes par le nom qu'il tape.
   * Ce sont exactement ceux que `theme <nom>` accepte et que `help theme`
   * liste. Sans elle, le catalogue du paquet en entier.
   *
   * Chacun se decrit par la clef `theme.<nom>` : a fournir dans votre
   * dictionnaire pour les votres, sans quoi la clef s'affiche telle quelle.
   */
  themes?: Record<string, ShellThemeInput>;
  /**
   * Vos textes, par langue. Ils recouvrent ceux du paquet clef par clef, et
   * une langue absente du paquet devient utilisable par `lang <code>`.
   */
  dict?: Dictionaries;
  /** langue de depart ; sans elle, le francais */
  lang?: string;
  /**
   * Commandes jouees au demarrage, apres la banniere, dans l'ordre du
   * tableau. Chacune part comme tapee ; les restreintes (`title`,
   * `welcome`...) sont jouees comme par la banniere. C'est ici que se met
   * l'ouverture — `["title", "welcome"]` pour le logo puis l'accueil.
   *
   * Jouees une seule fois, sur un ecran vierge : un `clear` ne les rejoue
   * pas. Ce qui doit revenir apres un `clear` va dans `banner`.
   */
  initialCommands?: string[];
  /**
   * Element a faire defiler quand la sortie s'allonge. Dans un cadre, c'est
   * le contenu de la fenetre : <Window> expose le sien par sa ref.
   */
  scrollRef?: RefObject<HTMLElement>;
  /** appele a chaque commande jouee, y compris celles du paquet */
  onCommand?: (name: string, args: string[]) => void;
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
  banner = [],
  theme,
  themes,
  dict,
  lang,
  initialCommands = [],
  scrollRef,
  onCommand,
}: ShellProps) => {
  // pose avant le premier rendu : le terminal lit le registre en se rendant
  const [ready] = useState(() => {
    // le dictionnaire d'abord : une commande jouee traduit en s'executant
    setDict(dict);
    setCommands(commands);
    setBanner(banner);
    // le catalogue avant le theme de depart : `help theme` et `theme <nom>`
    // lisent le premier, et le second n'a pas a en faire partie
    setThemes(themes);
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
    setBanner(banner);
  }, [banner]);

  useEffect(() => {
    setThemes(themes);
  }, [themes]);

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
      banner.forEach((name) => runRestricted(name));
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

  const scrollDown = useCallback(() => {
    scrollRef?.current?.scrollTo(0, 1000000);
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

  return (
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
};
