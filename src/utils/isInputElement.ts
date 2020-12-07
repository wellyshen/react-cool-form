export default (element: HTMLElement): element is HTMLInputElement =>
  element.tagName === "INPUT";
