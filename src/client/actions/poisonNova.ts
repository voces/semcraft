import { currentHero } from "../../hero.ts";
import { currentMouse } from "../systems/mouse.ts";
import { newCooldown } from "./util.ts";

const onCooldown = newCooldown(750);

export const poisonNova = {
  name: "Fire bolt",
  icon: "./assets/poisonnova.svg",
  description: "Fires a nova of poison.",
  handle: () => {
    const hero = currentHero();
    if (hero.mana < 0.1 || onCooldown()) return;

    const { ground: { x, y } } = currentMouse();
    return { action: "poisonNova", x, y, mana: Math.min(hero.mana, 5) };
  },
};
