import { Methods } from "./types";

const shared: Record<string, Methods> = {};

export const get = (id: string): Methods => shared[id];

export const set = (id: string, methods: Methods): void => {
  shared[id] = methods;
};

export const remove = (id: string): void => {
  delete shared[id];
};
