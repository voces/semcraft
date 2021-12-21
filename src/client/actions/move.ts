import { currentMouse } from "../systems/mouse.ts";

export const move = () => {
  const mouse = currentMouse();
  return { action: "move", x: mouse.ground.x, y: mouse.ground.y };
};
