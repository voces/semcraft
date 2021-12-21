import { System } from "../../core/System.ts";
import { currentSemcraft } from "../../semcraftContext.ts";

export const timers = () => {
  return {
    props: ["timeout"],
    updateChild: (entity, delta) => {
      entity.timeout.remaining -= delta;
      if (entity.timeout.remaining <= 0) {
        entity.timeout.callback();
      }
    },
  } as System<"timeout">;
};

export const newTimeout = (fn: () => void, timeout: number) => {
  const semcraft = currentSemcraft();
  const entity = semcraft.add({
    timeout: {
      remaining: timeout,
      callback: () => {
        semcraft.delete(entity);
        fn();
      },
    },
  });
};

export const newInterval = (fn: () => void, interval: number) => {
  const semcraft = currentSemcraft();
  const entity = semcraft.add({
    timeout: {
      remaining: interval,
      callback: () => {
        entity.timeout = {
          remaining: interval,
          callback: entity.timeout!.callback,
        };
        fn();
      },
    },
  });
};
