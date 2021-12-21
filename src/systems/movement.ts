import { Vector3 } from "three";
import { Entity } from "../core/Entity.ts";
import { System } from "../core/System.ts";
import { currentHero } from "../hero.ts";
import { currentThree } from "./three.ts";

export const movement = () => {
  return {
    props: ["moveTo", "mesh", "speed", "x", "y"],
    renderChild: (entity, delta) => {
      const dist = ((entity.moveTo.x - entity.mesh.position.x) ** 2 +
        (entity.moveTo.y - entity.mesh.position.y) ** 2) ** 0.5;

      entity.mesh.position.lerp(
        new Vector3(entity.moveTo.x, entity.moveTo.y),
        Math.min(entity.speed * delta / dist, 1),
      );

      try {
        const hero = currentHero();
        if (hero === entity) {
          const camera = currentThree().camera;
          camera.position.x = entity.mesh.position.x;
          camera.position.y = entity.mesh.position.y;
        }
      } catch { /*do nothing */ }
    },
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
  } as System<"moveTo" | "mesh" | "speed" | "x" | "y">;
};

export const movement2 = () => {
  return {
    props: ["moveAlong", "mesh", "speed", "x", "y"],
    renderChild: (entity, delta) => {
      entity.mesh.position.x += Math.cos(entity.moveAlong) * entity.speed *
        delta;
      entity.mesh.position.y += Math.sin(entity.moveAlong) * entity.speed *
        delta;
    },
    updateChild: (entity, delta) => {
      entity.x += Math.cos(entity.moveAlong) * entity.speed *
        delta;
      entity.y += Math.sin(entity.moveAlong) * entity.speed *
        delta;
    },
  } as System<"moveAlong" | "mesh" | "speed" | "x" | "y">;
};
