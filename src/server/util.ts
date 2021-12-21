import { Entity } from "../core/Entity.ts";

export const sameOwner = (a: Entity, b: Entity) => {
  while (a.owner) a = a.owner;
  while (b.owner) b = b.owner;

  return a === b;
};

export const setFind = <T>(set: ReadonlySet<T>, fn: (item: T) => boolean) => {
  for (const item of set) if (fn(item)) return item;
};
