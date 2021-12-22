import { System } from "../../core/System.ts";

// TODO: add mana deficient flag
export const newManaRegenSystem = () => ({
  props: ["mana"],
  updateChild: (entity, delta) => {
    // Mana regen is fixed at 1/s
    entity.mana = Math.min(entity.life ?? entity.mana, entity.mana + delta);
  },
} as System<"mana">);

// TODO: add life deficient flag
export const newLifeRegenSystem = () => ({
  props: ["life", "maxLife"],
  updateChild: (entity, delta) => {
    // Regen 1% of missing life per second, with minimum increase being 0.1 hp
    // 0 -> 10% takes ~11 seconds
    // 0 -> 25% takes ~29 seconds (+18)
    // 0 -> 50% takes ~69 seconds (+40)
    // 0 -> 75% takes ~138 seconds (+69)
    // 0 -> 90% takes ~229 seconds (+91)
    // 0 -> 100% takes ~329 seconds (+100)
    entity.life = Math.min(
      entity.life +
        Math.max((entity.maxLife - entity.life) * 0.01 * delta, 0.1),
      entity.maxLife,
    );
  },
} as System<"life" | "maxLife">);
