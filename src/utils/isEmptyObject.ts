import isPlainObject from "./isPlainObject";

export default (value: unknown): value is Record<string, never> =>
  isPlainObject(value) && !Object.keys(value).length;
