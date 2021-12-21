import { currentMouse } from "../systems/mouse.ts";
import { newCooldown } from "./util.ts";

const onCooldown = newCooldown(750);

export const firebolt = () => {
  if (onCooldown()) return;

  const { ground: { x, y } } = currentMouse();
  return { action: "firebolt", x, y };
};
