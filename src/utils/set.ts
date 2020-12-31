import cloneObject from "./cloneObject";
import isObject from "./isObject";
import isPlainObject from "./isPlainObject";
import stringToPath from "./stringToPath";

export default (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  object: any,
  path: string,
  value: unknown,
  immutable = false
): any => {
  if (!isPlainObject(object)) throw new TypeError("Expected an object.");

  const segs = stringToPath(path);
  const newObject = immutable ? cloneObject(object) : object;

  segs.slice(0, -1).reduce((obj, key, idx) => {
    if (isObject(obj[key])) return obj[key];
    const next = Number(segs[idx + 1]);
    obj[key] = Number.isInteger(next) && next >= 0 ? [] : {};
    return obj[key];
  }, newObject)[segs[segs.length - 1] || ""] = value;

  return newObject;
};
