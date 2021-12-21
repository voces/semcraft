import { Entity } from "../../core/Entity.ts";
import { System } from "../../core/System.ts";

export const moveToServer = () => ({
  props: ["moveTo", "speed", "x", "y"],
  updateChild: (entity, delta) => {
    const distRemaining = ((entity.moveTo.x - entity.x) ** 2 +
      (entity.moveTo.y - entity.y) ** 2) ** 0.5;
    const maxDistanceTravel = entity.speed * delta;
    const done = distRemaining <= maxDistanceTravel;
    const dist = done ? distRemaining : maxDistanceTravel;
    const angle = Math.atan2(
      entity.moveTo.y - entity.y,
      entity.moveTo.x - entity.x,
    );

    entity.x += dist * Math.cos(angle);
    entity.y += dist * Math.sin(angle);

    if (done) (entity as Entity).moveTo = undefined;
  },
} as System<"moveTo" | "speed" | "x" | "y">);

export const moveAlongServer = () => ({
  props: ["moveAlong", "speed", "x", "y"],
  updateChild: (entity, delta) => {
    entity.x += Math.cos(entity.moveAlong) * entity.speed *
      delta;
    entity.y += Math.sin(entity.moveAlong) * entity.speed *
      delta;
  },
} as System<"moveAlong" | "speed" | "x" | "y">);
