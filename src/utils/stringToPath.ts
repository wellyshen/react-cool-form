import compact from "./compact";
import isString from "./isString";

export default (str: string): string[] => {
  if (!isString(str)) throw new TypeError("Expected a string.");
  if (!str.length) return [];

  return compact(str.split(/[.[\]]+/));
};
