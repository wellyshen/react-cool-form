import { FieldElement } from "../types";

export default (element: HTMLElement): element is FieldElement =>
  /INPUT|TEXTAREA|SELECT/.test(element.tagName);
