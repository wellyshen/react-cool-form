import isPlainObject from "./isPlainObject";

const setValuesAsTrue = (object: unknown): any => {
  if (!Array.isArray(object) && !isPlainObject(object)) return true;

  if (Array.isArray(object)) return object.map((val) => setValuesAsTrue(val));

  return Object.keys(object).reduce((obj: Record<string, any>, key) => {
    obj[key] = setValuesAsTrue((object as Record<string, any>)[key]);
    return obj;
  }, {});
};

export default setValuesAsTrue;
