import { currentHero } from "../hero.ts";
import { currentMouse } from "../systems/mouse.ts";
import { action } from "./util.ts";

export const move = (() => {
  return action({
    clientHandler: () => {
      const mouse = currentMouse();
      return { action: "move", x: mouse.ground.x, y: mouse.ground.y };
    },
    serverHandler: (data) => {
      currentHero().moveTo = { x: data.x, y: data.y };
    },
  });
})();
