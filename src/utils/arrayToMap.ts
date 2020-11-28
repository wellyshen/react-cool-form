import { Map } from "../types";

export default (arr: any[]): Map =>
  arr.reduce((obj, key) => {
    obj[key] = true;
    return obj;
  }, {});
