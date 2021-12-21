import { currentMouse } from "../systems/mouse.ts";

let cooldown = -Infinity;
const COOLDOWN = 750;

export const firebolt = () => {
  const now = Date.now();
  if (now - cooldown < COOLDOWN) return;
  cooldown = now;

  const { ground: { x, y } } = currentMouse();
  return { action: "firebolt", x, y };
};
