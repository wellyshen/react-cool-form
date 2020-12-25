import isFunction from "./isFunction";

export default (value: unknown): value is Promise<any> =>
  isFunction(value) && value.constructor.name === "AsyncFunction";
