import isPlainObject from "./isPlainObject";

const getIsDirty = (dirty: object): boolean => {
  const search = (dirty: object, found: any[] = []) => {
    for (const val of Object.values(dirty)) {
      if (val === true) {
        found.push(val);
        return found;
      }

      if (isPlainObject(val)) search(val, found);
    }

    return found;
  };

  return !!search(dirty).length;
};

export default getIsDirty;
