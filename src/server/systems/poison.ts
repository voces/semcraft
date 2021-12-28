import { currentApp } from "../../core/appContext.ts";
import { Entity } from "../../core/Entity.ts";
import { System } from "../../core/System.ts";

const data = new WeakMap<
  Entity,
  [
    oldMaterial: NonNullable<Entity["art"]>["material"],
    newMaterial: NonNullable<Entity["art"]>["material"],
  ]
>();

export const newPoisonSystem = () => ({
  props: ["poisons", "life"],
  onAdd: (e) => {
    const material = { type: "phong" as const, color: "green" };
    data.set(e, [e.art?.material, material]);
    e.art = { ...e.art, material };
  },
  onRemove: (e) => {
    const previous = data.get(e);
    if (previous) {
      const [oldMaterial, poisonMaterial] = previous;
      if (e.art?.material === poisonMaterial) {
        e.art = { ...e.art, material: oldMaterial };
      }
      data.delete(e);
    }
  },
  updateChild: (entity, delta) => {
    let damage = 0;
    while (delta > 0 && entity.poisons) {
      const tick = Math.min(delta, entity.poisons[0].remaining);
      damage += entity.poisons[0].damage * tick;
      entity.poisons[0].remaining -= tick;
      delta -= tick;
      if (entity.poisons[0].remaining <= 0) {
        entity.poisons.shift();
        if (entity.poisons.length === 0) {
          (entity as Entity).poisons = undefined;
        }
      }
    }

    entity.life -= damage;

    if (entity.life <= 0) currentApp().delete(entity);
  },
} as System<"poisons" | "life">);
