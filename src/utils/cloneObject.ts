import isFileList from "./isFileList";
import isObject from "./isObject";

const cloneObject = (object: unknown): any => {
  if (object instanceof Event) throw new Error("Unable to clone event.");

  if (!isObject(object) || isFileList(object)) return object;

  if (object instanceof Date) return new Date(object.getTime());

  const obj = (Array.isArray(object) ? [] : {}) as any;

  for (const key in object) obj[key] = cloneObject((object as any)[key]);

  return obj;
};

export default cloneObject;
