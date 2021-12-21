import { System } from "../../core/System.ts";
import { currentSemcraft } from "../../semcraftContext.ts";

export const timers = () => {
  return {
    props: ["timeout", "callback"],
    updateChild: (entity, delta) => {
      entity.timeout -= delta;
      if (entity.timeout <= 0) {
        entity.callback();
      }
    },
  } as System<"timeout" | "callback">;
};

export const newTimeout = (fn: () => void, timeout: number) => {
  const semcraft = currentSemcraft();
  const entity = semcraft.add({
    timeout,
    callback: () => {
      semcraft.clear(entity);
      fn();
    },
  });
};

export const newInterval = (fn: () => void, interval: number) => {
  const semcraft = currentSemcraft();
  const entity = semcraft.add({
    timeout: interval,
    callback: () => {
      entity.timeout = interval;
      fn();
    },
  });
};
