/* eslint-disable no-prototype-builtins */

import cloneObject from "./cloneObject";
import isEmptyObject from "./isEmptyObject";
import isPlainObject from "./isPlainObject";
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

  if (Array.isArray(target)) {
    target.splice(parseInt(last, 10), 1);
  } else if (isPlainObject(target)) {
    delete target[last];
  }

  return isEmptyObject(target) || (Array.isArray(target) && !target.length)
    ? unset(refObject, segs.join("."))
    : refObject;
};

export default unset;
