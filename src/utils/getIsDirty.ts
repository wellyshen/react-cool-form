import isPlainObject from "./isPlainObject";

const getIsDirty = (object: object): boolean => {
  const search = (object: object, found: any[] = []) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const obj of Object.values(object)) {
      if (obj === true) {
        found.push(obj);
        return found;
      }

      if (isPlainObject(obj)) search(obj, found);
    }

    return found;
  };

  return !!search(object).length;
};

export default getIsDirty;
