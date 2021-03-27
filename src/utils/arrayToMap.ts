import { ObjMap } from "../types";

export default (arr: any[]): ObjMap =>
  arr.reduce((obj, key) => {
    obj[key] = true;
    return obj;
  }, {});
