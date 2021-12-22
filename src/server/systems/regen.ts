import { System } from "../../core/System.ts";

export const newManaRegenSystem = () => ({
  props: ["mana"],
  updateChild: (entity, delta) => {
    // Mana regen is fixed at 1/s
    entity.mana += delta;
  },
} as System<"mana">);
