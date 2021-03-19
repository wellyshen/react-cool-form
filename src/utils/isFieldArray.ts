import { FieldArray } from "../types";

export default (
  fields: FieldArray,
  name: string,
  callback?: (key: string) => void
): string | void => {
  let fieldName;

  Object.keys(fields).some((key) => {
    if (name.startsWith(key)) {
      fieldName = key;
      if (callback) callback(key);
      return true;
    }
    return false;
  });

  return fieldName;
};
