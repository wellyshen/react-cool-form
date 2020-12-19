import { Map } from "../types";

export default (array: any[]): Map =>
  array.reduce((obj, key) => {
    obj[key] = true;
    return obj;
  }, {});
