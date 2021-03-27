import { ObjMap } from "../types";
import isPlainObject from "./isPlainObject";

export default (value: unknown): value is ObjMap<never> =>
  isPlainObject(value) && !Object.keys(value).length;
