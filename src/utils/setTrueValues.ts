import { Map } from "../types";
import set from "./set";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default (object: any, paths: string[] | Record<string, any>): Map =>
  (Array.isArray(paths) ? paths : Object.keys(paths)).reduce((obj, path) => {
    obj = set(obj, path, true, true);
    return obj;
  }, object);
