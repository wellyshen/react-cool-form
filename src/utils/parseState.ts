import { FormState, Map, Path } from "../types";
import get from "./get";
import getPath from "./getPath";
import isPlainObject from "./isPlainObject";

export default (
  path: Path | undefined,
  state: FormState,
  pathHandler = getPath,
  errorHandler?: (path: string, state: any) => any,
  isGetState?: boolean
): any => {
  if (!path) return isGetState ? state : undefined;

  let parsedState;

  if (Array.isArray(path)) {
    parsedState = path.map((p) => {
      p = pathHandler(p);
      const value = get(state, p);
      return errorHandler ? errorHandler(p, value) : value;
    });
  } else if (isPlainObject(path)) {
    const paths = path as Map<string>;
    parsedState = Object.keys(paths).reduce((s: Map<any>, key) => {
      path = pathHandler(paths[key]);
      const value = get(state, path);
      s[key] = errorHandler ? errorHandler(path, value) : value;
      return s;
    }, {});
  } else {
    path = pathHandler(path);
    const value = get(state, path);
    parsedState = errorHandler ? errorHandler(path, value) : value;
  }

  return parsedState;
};
