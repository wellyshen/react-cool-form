import isObject from "./isObject";

export default (value: unknown): value is Object =>
  !Array.isArray(value) && isObject(value);
