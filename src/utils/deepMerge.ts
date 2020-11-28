import isArray from "./isArray";
import isObject from "./isObject";

const deepMerge = (...objects: any[]): any =>
  objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const prevValue = prev[key];
      const currValue = obj[key];

      if (isArray(prevValue) && isArray(currValue)) {
        prev[key] = [...prevValue, ...currValue];
      } else if (isObject(prevValue) && isObject(currValue)) {
        prev[key] = deepMerge(prevValue, currValue);
      } else {
        prev[key] = currValue;
      }
    });

    return prev;
  }, {});

export default deepMerge;
