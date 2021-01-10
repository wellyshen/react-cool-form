import cloneObject from "./cloneObject";
import get from "./get";
import isPlainObject from "./isPlainObject";
import isUndefined from "./isUndefined";
import stringToPath from "./stringToPath";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (object: any, path: string, immutable = false): any => {
  if (!isPlainObject(object)) throw new TypeError("Expected an object.");

  const refObject = immutable ? cloneObject(object) : object;
  let newObject = refObject;

  // eslint-disable-next-line no-prototype-builtins
  if (newObject.hasOwnProperty(path)) {
    delete newObject[path];
    return refObject;
  }

  if (!isUndefined(get(newObject, path))) {
    const segs = stringToPath(path);
    let last = segs.pop() as string;

    while (segs.length && segs[segs.length - 1].slice(-1) === "\\")
      last = `${(segs.pop() as string).slice(0, -1)}.${last}`;

    while (segs.length) newObject = newObject[(path = segs.shift() as string)];

    try {
      delete newObject[last];
    } catch (error) {
      // Ignore
    }
  }

  return refObject;
};
