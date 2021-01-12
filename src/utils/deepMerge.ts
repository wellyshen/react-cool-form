import isPlainObject from "./isPlainObject";

const deepMerge = (...objects: any[]): any =>
  objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const prevValue = prev[key];
      const currValue = obj[key];

      if (Array.isArray(prevValue) && Array.isArray(currValue)) {
        prev[key] = [...prevValue, ...currValue];
      } else if (isPlainObject(prevValue) && isPlainObject(currValue)) {
        prev[key] = deepMerge(prevValue, currValue);
      } else {
        prev[key] = currValue;
      }
    });

    return prev;
  }, {});

export default deepMerge;
