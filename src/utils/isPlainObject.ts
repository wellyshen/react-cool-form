import isObject from "./isObject";

export default (value: unknown): value is Object =>
  !Array.isArray(value) && !(value instanceof Date) && isObject(value);
