import "@testing-library/jest-dom"

/**
 * jsdom implements no scrolling: `scrollTo` is not even a function on an
 * element. The terminal is its own scroll box and follows its output down,
 * so every render of a shell would throw without this.
 */
Element.prototype.scrollTo = () => {}
