import { FieldElement } from "../types";
import isInputElement from "./isInputElement";

export default (element: HTMLElement): element is FieldElement =>
  isInputElement(element) || /TEXTAREA|SELECT/.test(element.tagName);
