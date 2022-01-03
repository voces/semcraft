import { Entity } from "../../core/Entity.ts";
import { System } from "../../core/System.ts";

export const newAttackSystem = () => ({
  props: ["x", "y", "attackTarget", "attack"],
  updateChild: (entity) => {
    const dist = ((entity.attackTarget.x - entity.x) ** 2 +
      (entity.attackTarget.y - entity.y) ** 2) ** 0.5;

    // Too far to attack
    if (dist > entity.attack.range) {
      // Attacker doesn't move or attackee is too far, so cancel attack
      // TODO: store a home point instead and have units return; this home
      // point could also be used to keep units "centered" when they randomly wander
      if (!entity.speed || dist > 25) {
        (entity as Entity).attackTarget = undefined;
        return;
      }

      // Already moving, update target
      if (entity.moveTo) {
        entity.moveTo.x = entity.attackTarget.x;
        entity.moveTo.y = entity.attackTarget.y;
        return;
      }

      entity.moveTo = { x: entity.attackTarget.x, y: entity.attackTarget.y };
      return;
    }

    // Clear moveTo
    if (entity.moveTo) entity.moveTo = undefined;

    if (entity.lockout) return;

    entity.lockout = entity.attack.cooldown;
    entity.attackTarget.life = (entity.attackTarget.life ?? 0) -
      entity.attack.damage;
    if (entity.attackTarget.life < 0) {
      (entity as Entity).attackTarget = undefined;
    }
  },
} as System<"x" | "y" | "attackTarget" | "attack">);
