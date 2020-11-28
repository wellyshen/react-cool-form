import isPlainObject from "./isPlainObject";

const filterError = (error: unknown, touched: unknown): any => {
  if (!isPlainObject(error) || error instanceof Date)
    return touched ? error : undefined;

  return Object.keys(error).reduce((obj: Record<string, any>, key) => {
    obj[key] = filterError(
      (error as Record<string, any>)[key],
      (touched as Record<string, any>)[key] || false
    );
    return obj;
  }, {});
};

export default filterError;
