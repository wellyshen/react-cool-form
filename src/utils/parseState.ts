import { FormState, ObjMap, Path } from "../types";
import get from "./get";
import getPath from "./getPath";
import isPlainObject from "./isPlainObject";

export default (
  path: Path | undefined,
  state: FormState,
  pathHandler = getPath,
  stateHandler?: (path: string, state: any) => any,
  isGetState?: boolean
): any => {
  if (!path) return isGetState ? state : undefined;

  let parsedState;

  if (Array.isArray(path)) {
    parsedState = path.map((p) => {
      p = pathHandler(p);
      const value = get(state, p);
      return stateHandler ? stateHandler(p, value) : value;
    });
  } else if (isPlainObject(path)) {
    const paths = path as ObjMap<string>;
    parsedState = Object.keys(paths).reduce((s: ObjMap<any>, key) => {
      path = pathHandler(paths[key]);
      const value = get(state, path);
      s[key] = stateHandler ? stateHandler(path, value) : value;
      return s;
    }, {});
  } else {
    path = pathHandler(path);
    const value = get(state, path);
    parsedState = stateHandler ? stateHandler(path, value) : value;
  }

  return parsedState;
};
