import isPlainObject from "./isPlainObject";
import isUndefined from "./isUndefined";

const filterErrors = (error: unknown, touched: unknown): any => {
  if (!isPlainObject(error) || error instanceof Date)
    return touched ? error : undefined;

  return Object.keys(error).reduce((obj: Record<string, any>, key) => {
    const nextErrors = filterErrors(
      (error as Record<string, any>)[key],
      (touched as Record<string, any>)[key] || false
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
