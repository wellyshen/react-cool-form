import { ObjMap, Methods } from "./types";

let one: Methods | undefined;
const all: ObjMap<Methods> = {};

export const get = (id?: string): Methods => (id ? all[id] : (one as Methods));

export const set = (id: string | undefined, methods: Methods): void => {
  if (id) {
    all[id] = methods;
  } else {
    one = methods;
  }
};

export const remove = (id?: string): void => {
  if (id) {
    delete all[id];
  } else {
    one = undefined;
  }
};
