import isPlainObject from "./isPlainObject";
import isUndefined from "./isUndefined";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (object: any, path: string, defaultValue?: unknown): any => {
  if (!isPlainObject(object) || !path) return defaultValue;

  const value = path
    .split(/[,[\].]+?/)
    .filter(Boolean)
    .reduce((obj, key) => (obj || {})[key], object);

  return isUndefined(value) ? defaultValue : value;
};
