import type { Semcraft } from "../semcraft.ts";
import { currentSemcraft } from "../semcraftContext.ts";

export const data = <T>() => {
  const map = new WeakMap<Semcraft, T>();

  return {
    current: () => {
      const datum = map.get(currentSemcraft());
      if (!datum) {
        throw new Error("Expected data to be initialized");
      }
      return datum!;
    },
    tryGetHero: () => {
      return map.get(currentSemcraft());
    },
    set: (value: T) => {
      map.set(currentSemcraft(), value);
    },
  };
};
