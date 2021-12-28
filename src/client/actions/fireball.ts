import { currentHero } from "../../hero.ts";
import { currentMouse } from "../systems/mouse.ts";
import { newCooldown } from "./util.ts";

const fireballFormula = (
  cooldown: number,
  mana: { fire: number; conjuration: number; splash: number },
) => {
  const onCooldown = newCooldown(cooldown);

  return {
    name: "Fire ball",
    icon: "./assets/fireball.svg",
    description: "Fires a fire ball, which does splash damage.",
    handle: () => {
      const hero = currentHero();
      if (hero.mana < 0.1 || onCooldown()) return;

      const wantedMana = Object.values(mana).reduce((sum, v) => sum + v, 0);
      const p = Math.min(hero.mana, wantedMana) / wantedMana;

      const { ground: { x, y } } = currentMouse();
      return {
        action: "fireball",
        x,
        y,
        fireMana: mana.fire * p - 1e-15,
        conjurationMana: mana.conjuration * p - 1e-15,
        splashMana: mana.splash * p - 1e-15,
      };
    },
    cooldown,
    mana,
    formulate: fireballFormula,
  };
};

export const fireball = fireballFormula(750, {
  fire: 3.9,
  conjuration: 0.1,
  splash: 1,
});
