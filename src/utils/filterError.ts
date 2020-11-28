import isPlainObject from "./isPlainObject";

const filterError = (error: unknown, touched: unknown): any => {
  if (!isPlainObject(error) || error instanceof Date)
    return touched ? error : false;

  return Object.keys(error).reduce((obj: Record<string, any>, key) => {
    const nextError = filterError(
      (error as Record<string, any>)[key],
      (touched as Record<string, any>)[key] || false
    );

    if (nextError) {
      obj[key] = nextError;
    } else {
      delete obj[key];
    }

    return obj;
  }, {});
};

export default filterError;
