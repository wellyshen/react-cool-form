import isObject from "./isObject";

const getIsDirty = (dirty: object): boolean => {
  const search = (dty: object, found: any[] = []) => {
    for (const val of Object.values(dty)) {
      if (val === true) {
        found.push(val);
        return found;
      }

      if (isObject(val)) search(val, found);
    }

    return found;
  };

  return !!search(dirty).length;
};

export default getIsDirty;
