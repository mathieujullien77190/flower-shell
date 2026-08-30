import { CSSProperties } from "react";

/** un dictionnaire de textes, imbrique : `t("help.desc")` en lit le chemin */
export type Dict = { [key: string]: string | Dict };

/** les dictionnaires du shell, un par langue */
export type Dictionaries = Record<string, Dict>;

/**
 * Un texte statique : une clef du dictionnaire, ou le texte lui-meme. Le
 * shell le passe par `t()` au moment de s'en servir, et une clef inconnue
 * s'affiche telle quelle — d'ou les deux usages sous un seul type.
 */
export type Text = string;

export type Help = {
  description?: Text;
  patterns: { pattern: string; description: Text }[];
};

/**
 * L'aide d'une commande, ou de quoi la produire. La fonction est lue a
 * l'affichage : c'est ce qui permet a `lang` d'annoncer les langues
 * reellement montees, que le consommateur pose bien apres.
 */
export type HelpInput = Help | (() => Help);

export type Action = ({
  name,
  args,
  help,
  commands,
}: {
  name?: Command["name"];
  args?: Command["args"];
  help?: Help;
  commands?: BaseCommands;
}) => string;

/**
 * Les arguments acceptes. `authorize` peut etre une fonction : la commande
 * `lang` doit lire les langues du dictionnaire, pose par le consommateur
 * bien apres que les commandes aient ete definies.
 */
export type Args = {
  authorize: string[] | (() => string[]);
  empty: boolean;
};

export type BaseCommand = {
  restricted: boolean;
  action: Action;
  /** effet de bord de la commande : elle attaque le store elle-meme */
  effect?: ({ args }: { args?: Command["args"] }) => void;
  JSX?: ({ args }: { args?: Command["args"] }) => import("react").JSX.Element;
  help?: HelpInput;
  testArgs?: Args;
  display?: {
    hideCmd?: boolean;
    style?: CSSProperties;
    stylePre?: CSSProperties;
    /** rendu colore du resultat ; une chaine intacte est un rendu valide */
    highlight?: (txt: string) => import("react").ReactNode;
    reverse?: boolean;
    stepTime?: number;
    stepSize?: number;
    animation?: boolean;
  };
};

/**
 * Les commandes connues, indexees par le nom qui les invoque. Celles du
 * paquet sont nommees : l'editeur les propose, et une clef mal orthographiee
 * se voit. Toutes sont facultatives — un shell peut n'en garder aucune — et
 * la signature d'index accueille les votres.
 */
export type BaseCommands = {
  help?: BaseCommand;
  clear?: BaseCommand;
  hello?: BaseCommand;
  flowers?: BaseCommand;
  animation?: BaseCommand;
  theme?: BaseCommand;
  lang?: BaseCommand;
  /**
   * le banc d'essai du balisage : une commande, tout le rendu. Il ne part
   * pas avec `baseCommands`, il se monte a la main
   */
  test?: BaseCommand;
  /** le mot d'accueil et le logo : restreints, joues par la banniere */
  welcome?: BaseCommand;
  title?: BaseCommand;
  /** restreintes aussi, cherchees par nom quand la saisie ne passe pas */
  unknow?: BaseCommand;
  argumenterror?: BaseCommand;
  /** restreinte : l'aiguillage des marqueurs cliquables `#libelle ~ cmd#` */
  actionmap?: BaseCommand;
};

export type Command = {
  pattern: string;
  name: string;
  args: string[];
  /** le texte affiche, deja traduit : `t()` a joue a l'execution */
  result: string;
  restricted: boolean;
  visible?: boolean;
  timestamp?: number;
  /**
   * Le rang d'arrivee dans la session, strictement croissant. C'est lui qui
   * ordonne l'affichage, et non `timestamp` : deux commandes enchainees dans
   * la meme boucle tombent sur la meme milliseconde.
   */
  order?: number;
  id: string;
  canExecute: boolean;
  isRendered: boolean;
};
