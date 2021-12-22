import { currentHero } from "../../hero.ts";
import { currentMouse } from "../systems/mouse.ts";
import { newCooldown } from "./util.ts";

const onCooldown = newCooldown(750);

export const firebolt = () => {
  const hero = currentHero();
  if (hero.mana < 0.1 || onCooldown()) return;

  const { ground: { x, y } } = currentMouse();
  return { action: "firebolt", x, y, mana: Math.min(hero.mana, 5) };
};
