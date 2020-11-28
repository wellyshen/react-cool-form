import isArray from "./isArray";
import isObject from "./isObject";

export default (value: unknown): value is Object =>
  !isArray(value) && isObject(value);
