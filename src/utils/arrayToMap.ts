import { ObjMap } from "../types";

export default (arr: any[], map: Record<string, string> = {}): ObjMap =>
  arr.reduce((obj, key) => {
    obj[map[key] || key] = true;
    return obj;
  }, {});
