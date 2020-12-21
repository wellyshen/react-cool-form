import { Map } from "../types";
import set from "./set";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (object: any, names: string[]): Map =>
  names.reduce((obj, name) => {
    obj = set(obj, name, true, true);
    return obj;
  }, object);
