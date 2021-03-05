/* eslint-disable no-prototype-builtins */

import cloneObject from "./cloneObject";
import isObject from "./isObject";
import isPlainObject from "./isPlainObject";
import isUndefined from "./isUndefined";
import stringToPath from "./stringToPath";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const unset = (object: any, path: string, immutable = false): any => {
  if (!isPlainObject(object)) throw new TypeError("Expected an object.");

  const refObject = immutable ? cloneObject(object) : object;
  const newObject = refObject;

  if (newObject.hasOwnProperty(path)) {
    delete newObject[path];
    return refObject;
  }

  const segs = stringToPath(path);

  if (!segs.length) return refObject;

  const last = segs.pop() as string;
  const target = segs.reduce((obj, key) => (obj || {})[key], newObject);

  if (isObject(target) && target.hasOwnProperty(last)) delete target[last];

  return (isPlainObject(target) &&
    Object.values(target).every((value) => isUndefined(value))) ||
    (Array.isArray(target) && target.every((value) => isUndefined(value)))
    ? unset(refObject, segs.join("."))
    : refObject;
};

export default unset;
