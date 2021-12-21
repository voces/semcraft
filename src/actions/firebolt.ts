import { currentHero } from "../hero.ts";
import { currentSemcraft } from "../semcraftContext.ts";
import { currentMouse } from "../systems/mouse.ts";
import { action } from "./util.ts";

export const firebolt = action({
  clientHandler: () => {
    const { ground: { x, y } } = currentMouse();
    return { action: "firebolt", x, y };
  },
  serverHandler: ({ x, y }) => {
    const semcraft = currentSemcraft();
    const hero = currentHero();

    const firebolt = semcraft.add({
      x: hero.x,
      y: hero.y,
      moveAlong: Math.atan2(y - hero.y!, x - hero.x!),
      art: {
        geometry: {
          type: "sphere",
          radius: 0.125,
        },
        material: {
          type: "phong",
          color: "red",
        },
      },
      speed: 7.5,
      timeout: 5,
      callback: () => semcraft.clear(firebolt),
    });
  },
});
