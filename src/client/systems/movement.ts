import { Vector3 } from "three";
import { System } from "../../core/System.ts";
import { currentHero } from "../../hero.ts";
import { currentThree } from "./three.ts";

export const moveToClient = () => ({
  props: ["moveTo", "mesh", "speed", "x", "y"],
  updateChild: (entity, delta) => {
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
} as System<"moveTo" | "mesh" | "speed" | "x" | "y">);

export const moveAlongClient = () => ({
  props: ["moveAlong", "mesh", "speed", "x", "y"],
  updateChild: (entity, delta) => {
    entity.mesh.position.x += Math.cos(entity.moveAlong) * entity.speed *
      delta;
    entity.mesh.position.y += Math.sin(entity.moveAlong) * entity.speed *
      delta;
  },
} as System<"moveAlong" | "mesh" | "speed" | "x" | "y">);
