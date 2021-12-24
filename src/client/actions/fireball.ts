import { currentHero } from "../../hero.ts";
import { currentMouse } from "../systems/mouse.ts";
import { newCooldown } from "./util.ts";

const onCooldown = newCooldown(750);

export const fireball = {
  name: "Fire ball",
  icon: "./assets/fireball.svg",
  description: "Fires a fire ball, which does splash damage.",
  handle: () => {
    const hero = currentHero();
    if (hero.mana < 0.1 || onCooldown()) return;

    const { ground: { x, y } } = currentMouse();
    return { action: "fireball", x, y, mana: Math.min(hero.mana, 5) };
  },
};
