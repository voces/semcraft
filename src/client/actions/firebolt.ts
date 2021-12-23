import { currentHero } from "../../hero.ts";
import { currentMouse } from "../systems/mouse.ts";
import { newCooldown } from "./util.ts";

const onCooldown = newCooldown(750);

export const firebolt = {
  name: "Fire bolt",
  // https://game-icons.net/1x1/lorc/plasma-bolt.html
  icon: "./assets/firebolt.svg",
  description: "Fires a fire bolt.",
  handle: () => {
    const hero = currentHero();
    if (hero.mana < 0.1 || onCooldown()) return;

    const { ground: { x, y } } = currentMouse();
    return { action: "firebolt", x, y, mana: Math.min(hero.mana, 5) };
  },
};
