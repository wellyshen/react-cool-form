import isPlainObject from "./isPlainObject";
import isUndefined from "./isUndefined";
import stringToPath from "./stringToPath";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (object: any, path: string, defaultValue?: unknown): any => {
  if (!isPlainObject(object) || !path) return defaultValue;

  const value = stringToPath(path).reduce(
    (obj, key) => (obj || {})[key],
    object
  );

  return !isUndefined(value) ? value : defaultValue;
};
