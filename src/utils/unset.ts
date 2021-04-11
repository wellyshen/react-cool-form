import cloneObject from "./cloneObject";
import isEmptyObject from "./isEmptyObject";
import isPlainObject from "./isPlainObject";
import isUndefined from "./isUndefined";
import stringToPath from "./stringToPath";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const unset = (object: any, path: string, immutable?: boolean): any => {
  if (!isPlainObject(object)) throw new TypeError("Expected an object.");

  const refObject = immutable ? cloneObject(object) : object;
  const newObject = refObject;

  // eslint-disable-next-line no-prototype-builtins
  if (newObject.hasOwnProperty(path)) {
    delete newObject[path];
    return refObject;
  }

  const segs = stringToPath(path);

  if (!segs.length) return refObject;

  const last = segs.pop() as string;
  const target = segs.reduce((obj, key) => (obj || {})[key], newObject);

  if (Array.isArray(target)) {
    let index = +last;

    if (index < target.length - 1) {
      target.splice(index, 1);
    } else {
      while (index >= 0) {
        // @ts-expect-error
        if (index == last || isUndefined(target[index])) {
          target.splice(index, 1);
          index -= 1;
        } else {
          break;
        }
      }
    }
  } else if (isPlainObject(target)) {
    delete target[last];
  }

  return isEmptyObject(target) || (Array.isArray(target) && !target.length)
    ? unset(refObject, segs.join("."))
    : refObject;
};

export default unset;
