import { Entity } from "../../core/Entity.ts";
import { System } from "../../core/System.ts";

export const newLockoutSystem = () => ({
  props: ["lockout"],
  updateChild: (entity, delta) => {
    if (entity.lockout < delta) (entity as Entity).lockout = undefined;
    else entity.lockout -= delta;
  },
} as System<"lockout">);
