import isObject from "./isObject";
import isFileList from "./isFileList";

const cloneObject = (object: unknown): any => {
  if (object instanceof Event) throw new Error("Unable to clone event.");
  
  if (!isObject(object) || isFileList(object)) return object;

  if (object instanceof Date) return new Date(object.getTime());

  if (Array.isArray(object)) return object.map((val) => cloneObject(val));

  if (isObject(object))
    return Object.keys(object).reduce((obj: Record<string, any>, key) => {
      obj[key] = cloneObject((object as Record<string, any>)[key]);
      return obj;
    }, {});

  throw new Error("Unable to clone object.");
};

export default cloneObject;
