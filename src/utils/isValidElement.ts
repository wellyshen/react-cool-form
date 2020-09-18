export default (el: HTMLElement): boolean =>
  el && ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName);
