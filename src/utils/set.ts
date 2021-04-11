import cloneObject from "./cloneObject";
import isPlainObject from "./isPlainObject";
import stringToPath from "./stringToPath";

export default (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  object: any,
  path: string,
  value: unknown,
  immutable?: boolean
): any => {
  if (!isPlainObject(object)) throw new TypeError("Expected an object.");

  const newObject = immutable ? cloneObject(object) : object;
  const segs = stringToPath(path);

  segs.slice(0, -1).reduce((obj, key, idx) => {
    const nextIsNumber = !Number.isNaN(+segs[idx + 1]);
    if (
      (isPlainObject(obj[key]) && !nextIsNumber) ||
      (Array.isArray(obj[key]) && nextIsNumber)
    )
      return obj[key];
    obj[key] = nextIsNumber ? [] : {};
    return obj[key];
  }, newObject)[segs[segs.length - 1] || ""] = value;

  return newObject;
};
