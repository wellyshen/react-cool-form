import { Map } from "../types";
import isPlainObject from "./isPlainObject";

export default (value: unknown): value is Map<never> =>
  isPlainObject(value) && !Object.keys(value).length;
