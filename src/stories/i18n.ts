/**
 * La langue de la documentation. Ce n'est pas celle du shell : le terminal
 * a la sienne, posee par la prop `lang`, et une story peut parfaitement
 * parler anglais dans une page lue en francais.
 */
export const LOCALES = ["en", "fr"] as const

export type Locale = (typeof LOCALES)[number]

/** un texte de documentation, dans les deux langues */
export type Prose = Record<Locale, string>

/**
 * La prose d'une page docs, posee sur le `meta`.
 *
 * Elle ne peut pas rester dans un commentaire au-dessus du meta : Storybook
 * les extrait a la construction, et un choix fait dans la barre d'outils
 * n'y changerait rien. En parametre, la page docs la lit au rendu et suit
 * la langue courante.
 *
 * Corollaire : le meta perd son commentaire, et avec lui l'injection de
 * `parameters` que le plugin CSF fait aux metas qui en portent un — c'est
 * elle qui interdisait de poser des parametres a ce niveau.
 */
export const prose = (text: Prose) => ({ docs: { prose: text } })
