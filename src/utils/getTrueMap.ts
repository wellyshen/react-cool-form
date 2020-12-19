import { Map } from "../types";
import set from "./set";

export default (target: string[] | Record<string, any>): Map =>
  (Array.isArray(target) ? target : Object.keys(target)).reduce((acc, key) => {
    acc = set(acc, key, true);
    return acc;
  }, {});
