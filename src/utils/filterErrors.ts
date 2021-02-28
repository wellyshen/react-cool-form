import { Map } from "../types";
import isPlainObject from "./isPlainObject";
import isUndefined from "./isUndefined";

const filterErrors = (error: unknown, touched: unknown): any => {
  if (!isPlainObject(error)) return touched ? error : undefined;

  return Object.keys(error).reduce((obj: Map<any>, key) => {
    const nextErrors = filterErrors(
      (error as Map<any>)[key],
      (touched as Map<any>)[key] || false
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
