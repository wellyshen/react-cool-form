import { ObjMap } from "../types";
import isPlainObject from "./isPlainObject";
import isUndefined from "./isUndefined";

const filterErrors = (error: unknown, touched: unknown): any => {
  if (!isPlainObject(error)) return touched ? error : undefined;

  return Object.keys(error).reduce((obj: ObjMap<any>, key) => {
    const nextErrors = filterErrors(
      (error as ObjMap<any>)[key],
      (touched as ObjMap<any>)[key] || false
    );

    if (!isUndefined(nextErrors)) {
      obj[key] = nextErrors;
    } else {
      delete obj[key];
    }

    return obj;
  }, {});
};

export default filterErrors;
