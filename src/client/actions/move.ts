import { currentMouse } from "../systems/mouse.ts";
import { newThrottle } from "./util.ts";

const onCooldown = newThrottle(250);

export const move = {
  name: "Move",
  icon: "./assets/move.svg",
  handle: async () => {
    if (await onCooldown()) return;

    const mouse = currentMouse();
    return { action: "move", x: mouse.ground.x, y: mouse.ground.y };
  },
};
